import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node';
import { Uri, window } from 'vscode';
import * as kubernetes from 'vscode-kubernetes-tools-api';
import { ContextTypes, setContext } from '../context';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { output } from '../output';
import { parseJson } from '../utils/jsonUtils';
import { BucketResult } from './bucket';
import { GitRepositoryResult } from './gitRepository';
import { HelmReleaseResult } from './helmRelease';
import { HelmRepositoryResult } from './helmRepository';
import { KubernetesConfig } from './kubernetesConfig';
import { KubernetesFileSchemes } from './kubernetesFileSchemes';
import { ClusterProvider, DeploymentResult, KubectlVersionResult, NamespaceResult, NodeResult, PodResult } from './kubernetesTypes';
import { KustomizeResult } from './kustomize';

/**
 * Defines Kubernetes Tools class for integration
 * with Microsoft Kubernetes Tools extension API.
 * @see https://github.com/Azure/vscode-kubernetes-tools
 * @see https://github.com/Azure/vscode-kubernetes-tools-api
 */
class KubernetesTools {

	/**
	 * Keep a reference to the Kubernetes extension api.
	 */
	private kubectlApi?: kubernetes.KubectlV1;

	/**
	 * Current cluster supported kubernetes resource kinds.
	 */
	private clusterSupportedResourceKinds?: string[];

	/**
	 * Gets kubernetes tools extension kubectl api reference.
	 * @see https://github.com/Azure/vscode-kubernetes-tools-api
	 */
	async getKubectlApi() {
		if (this.kubectlApi) {
			return this.kubectlApi;
		}
		const kubectl = await kubernetes.extension.kubectl.v1;
		if (!kubectl.available) {
			window.showErrorMessage(`Kubernetes Tools Kubectl API is unavailable: ${kubectl.reason}`);
			return;
		}
		this.kubectlApi = kubectl.api;
		return this.kubectlApi;
	}

	/**
	 * Invokes kubectl command via Kubernetes Tools API.
	 * @param command Kubectl command to run.
	 * @returns Kubectl command results.
	 */
	 async invokeKubectlCommand(command: string): Promise<kubernetes.KubectlV1.ShellResult | undefined> {
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}

		const kubectlShellResult = await kubectl.invokeCommand(command);

		output.send(`> ${command}\n`, {
			channelName: 'GitOps: kubectl',
			addNewline: false,
			revealOutputView: false,
		});

		if (kubectlShellResult?.code === 0) {
			output.send(kubectlShellResult.stdout, {
				channelName: 'GitOps: kubectl',
				revealOutputView: false,
			});
		} else {
			output.send(kubectlShellResult?.stderr || '', {
				channelName: 'GitOps: kubectl',
				revealOutputView: false,
				logLevel: 'error',
			});
		}

		return kubectlShellResult;
	}

	/**
	 * Gets current kubectl config with available contexts and clusters.
	 */
	async getKubectlConfig(): Promise<undefined | KubernetesConfig> {
		const configShellResult = await this.invokeKubectlCommand('config view -o json');
		if (!configShellResult || configShellResult.stderr) {
			console.warn(`Failed to get kubectl config: ${configShellResult?.stderr}`);
			return;
		}
		return parseJson(configShellResult.stdout);
	}

	/**
	 * Gets current kubectl context name.
	 */
	async getCurrentContext(): Promise<undefined | string> {
		const currentContextShellResult = await this.invokeKubectlCommand('config current-context');
		if (!currentContextShellResult || currentContextShellResult.stderr) {
			console.warn(`Failed to get current kubectl context: ${currentContextShellResult?.stderr}`);
			setContext(ContextTypes.NoClusterSelected, true);
			return;
		}
		const currentContext = currentContextShellResult.stdout.trim();
		setContext(ContextTypes.NoClusterSelected, !currentContext);
		return currentContext;
	}

	/**
	 * Sets current kubectl context.
	 * @param contextName Kubectl context name to use.
	 * @returns `undefined` in case of an error or Object with information about
	 * whether or not context was switched or didn't need it (current).
	 */
	async setCurrentContext(contextName: string): Promise<undefined | { isChanged: boolean;	}> {
		const currentContext = await this.getCurrentContext();
		if (currentContext && currentContext === contextName) {
			return {
				isChanged: false,
			};
		}

		const setContextShellResult = await this.invokeKubectlCommand(`config use-context ${contextName}`);
		if (setContextShellResult?.stderr) {
			window.showErrorMessage(`Failed to set kubectl context to ${contextName}: ${setContextShellResult?.stderr}`);
			return;
		}

		setContext(ContextTypes.NoClusterSelected, false);
		setContext(ContextTypes.CurrentClusterFluxNotInstalled, false);
		setContext(ContextTypes.NoSources, false);
		setContext(ContextTypes.NoWorkloads, false);
		this.clusterSupportedResourceKinds = undefined;

		// TODO: maybe emit an event?
		checkIfOpenedFolderGitRepositorySourceExists();

		return {
			isChanged: true,
		};
	}

	/**
	 * Gets all clusters from the local kubectl config.
	 */
	async getClusters() {
		const kubectlConfigValue = await this.getKubectlConfig();
		if (!kubectlConfigValue) {
			return;
		}
		return kubectlConfigValue.clusters;
	}

	/**
	 * Get pods (filter by name and namespace).
	 * @param name pod target name
	 * @param namespace pod target namespace
	 */
	async getPods(name = '', namespace = ''): Promise<undefined | PodResult> {
		const nameArg = name ? `-l app=${name}` : '';

		let namespaceArg = '';
		if (namespace === 'all') {
			namespaceArg = '--all-namespaces';
		} else if (namespace.length > 0) {
			namespaceArg = `--namespace=${namespace}`;
		}

		const podResult = await this.invokeKubectlCommand(`get pod ${nameArg} ${namespaceArg} -o json`);

		if (!podResult || podResult.code !== 0) {
			console.warn(`Failed to get pods: ${podResult?.stderr}`);
			return;
		}

		return parseJson(podResult?.stdout);
	}

	/**
	 * Gets all kustomizations for the current kubectl context.
	 */
	async getKustomizations(): Promise<undefined | KustomizeResult> {
		const kustomizationShellResult = await this.invokeKubectlCommand('get Kustomization -A -o json');
		if (!kustomizationShellResult || kustomizationShellResult.stderr) {
			console.warn(`Failed to get kubectl kustomizations: ${kustomizationShellResult?.stderr}`);
			return;
		}
		return parseJson(kustomizationShellResult.stdout);
	}

	/**
	 * Gets all helm releases from the current kubectl context.
	 */
	async getHelmReleases(): Promise<undefined | HelmReleaseResult> {
		const helmReleaseShellResult = await this.invokeKubectlCommand('get HelmRelease -A -o json');
		if (!helmReleaseShellResult || helmReleaseShellResult.stderr) {
			console.warn(`Failed to get kubectl helm releases: ${helmReleaseShellResult?.stderr}`);
			return;
		}
		return parseJson(helmReleaseShellResult.stdout);
	}

	/**
	 * Gets all git repositories for the current kubectl context.
	 */
	async getGitRepositories(): Promise<undefined | GitRepositoryResult> {
		const gitRepositoryShellResult = await this.invokeKubectlCommand('get GitRepository -A -o json');
		if (!gitRepositoryShellResult || gitRepositoryShellResult.stderr) {
			console.warn(`Failed to get kubectl git repositories: ${gitRepositoryShellResult?.stderr}`);
			return;
		}
		return parseJson(gitRepositoryShellResult.stdout);
	}

	/**
	 * Gets all helm repositories for the current kubectl context.
	 */
	async getHelmRepositories(): Promise<undefined | HelmRepositoryResult> {
		const helmRepositoryShellResult = await this.invokeKubectlCommand('get HelmRepository -A -o json');
		if (!helmRepositoryShellResult || helmRepositoryShellResult.stderr) {
			console.warn(`Failed to get kubectl helm repositories: ${helmRepositoryShellResult?.stderr}`);
			return;
		}
		return parseJson(helmRepositoryShellResult.stdout);
	}

	/**
	 * Gets all buckets for the current kubectl context.
	 */
	async getBuckets(): Promise<undefined | BucketResult> {
		const bucketShellResult = await this.invokeKubectlCommand('get Bucket -A -o json');
		if (!bucketShellResult || bucketShellResult.stderr) {
			console.warn(`Failed to get kubectl buckets: ${bucketShellResult?.stderr}`);
			return;
		}
		return parseJson(bucketShellResult.stdout);
	}

	/**
	 * Get all flux system deployments.
	 */
	async getFluxControllers(context?: string): Promise<undefined | DeploymentResult> {
		const contextArg = context ? `--context ${context}` : '';

		const fluxDeploymentShellResult = await this.invokeKubectlCommand(`get deployment --namespace=flux-system ${contextArg} -o json`);

		if (fluxDeploymentShellResult?.code !== 0) {
			console.warn(`Failed to get flux controllers: ${fluxDeploymentShellResult?.stderr}`);
			return;
		}

		return parseJson(fluxDeploymentShellResult.stdout);
	}

	/**
	 * Return true if gitops is enabled in the current cluster.
	 * Function checks if `flux-system` namespace contains flux controllers.
	 * @param clusterName target cluster name
	 */
	async isGitOpsEnabled(clusterName: string) {
		const fluxControllers = await this.getFluxControllers(clusterName);

		if (!fluxControllers) {
			return;
		}

		return fluxControllers.items.length !== 0;
	}

	/**
	 * Return all available kubernetes resource kinds.
	 */
	async getAvailableResourceKinds(): Promise<string[] | undefined> {
		if (this.clusterSupportedResourceKinds) {
			return this.clusterSupportedResourceKinds;
		}

		const kindsShellResult = await this.invokeKubectlCommand('api-resources --verbs=list -o name');
		if (!kindsShellResult || kindsShellResult.stderr) {
			this.clusterSupportedResourceKinds = undefined;
			console.warn(`Failed to get resource kinds: ${kindsShellResult?.stderr}`);
			return;
		}

		const kinds = kindsShellResult.stdout
			.split('\n')
			.filter(kind => kind.length);

		this.clusterSupportedResourceKinds = kinds;
		return kinds;
	}

	/**
	 * Return all kubernetes resources that were created by a kustomize/helmRelease.
	 * @param name name of the kustomize/helmRelease object
	 * @param namespace namespace of the kustomize/helmRelease object
	 */
	async getChildrenOfWorkload(
		workload: 'kustomize' | 'helm',
		name: string,
		namespace: string,
	): Promise<KubernetesListObject<KubernetesObject> | undefined> {
		const resourceKinds = await this.getAvailableResourceKinds();
		if (!resourceKinds) {
			return;
		}

		const query = `get ${resourceKinds.join(',')} -l ${workload}.toolkit.fluxcd.io/name=${name} -n ${namespace} -o json`;
		const resourcesShellResult = await this.invokeKubectlCommand(query);

		if (!resourcesShellResult || resourcesShellResult.code !== 0) {
			window.showErrorMessage(`Failed to get ${workload} created resources: ${resourcesShellResult?.stderr}`);
			return undefined;
		}

		return parseJson(resourcesShellResult.stdout);
	}

	/**
	 * Get namespaces from current context.
	 */
	async getNamespaces(): Promise<undefined | NamespaceResult> {
		const namespacesShellResult = await this.invokeKubectlCommand('get ns -o json');

		if (namespacesShellResult?.code !== 0) {
			window.showErrorMessage(`Failed to get namespaces ${namespacesShellResult?.stderr}`);
			return;
		}

		return parseJson(namespacesShellResult.stdout);
	}

	/**
	 * Try to detect known cluster providers.
	 * @param context target context to get resources from.
	 */
	async detectClusterProvider(context: string): Promise<ClusterProvider> {
		const tryProviderAKS = await this.isClusterAKS(context);
		if (tryProviderAKS === ClusterProvider.AKS) {
			return ClusterProvider.AKS;
		}

		const tryProviderAzureARC = await this.isClusterAzureARC(context);
		if (tryProviderAzureARC === ClusterProvider.AzureARC) {
			return ClusterProvider.AzureARC;
		}

		if (tryProviderAKS === ClusterProvider.Unknown ||
			tryProviderAzureARC === ClusterProvider.Unknown) {
			return ClusterProvider.Unknown;
		} else {
			return ClusterProvider.Generic;
		}
	}

	/**
	 * Try to determine if the cluster is AKS or not.
	 * @param context target context to get resources from.
	 */
	async isClusterAKS(context: string): Promise<ClusterProvider> {
		const nodesShellResult = await this.invokeKubectlCommand(`get nodes --context=${context} -o json`);

		if (nodesShellResult?.code !== 0) {
			console.warn(`Failed to get nodes from "${context}" context to determine the cluster type.`);
			return ClusterProvider.Unknown;
		}

		const nodes: NodeResult | undefined = parseJson(nodesShellResult.stdout);
		if (!nodes) {
			return ClusterProvider.Unknown;
		}
		const firstNode = nodes.items[0];

		if (!firstNode) {
			console.warn(`No nodes in the "${context}" context to determine the cluster type.`);
			return ClusterProvider.Unknown;
		}

		const providerID = firstNode.spec.providerID;

		if (providerID?.startsWith('azure:///')) {
			return ClusterProvider.AKS;
		} else {
			return ClusterProvider.Generic;
		}
	}

	/**
	 * Try to determine if the cluster is managed by Azure ARC or not.
	 * @param context target context to get resources from.
	 */
	async isClusterAzureARC(context: string): Promise<ClusterProvider> {
		const deploymentsShellResult = await this.invokeKubectlCommand(`get deployments -n azure-arc --context=${context} -o json`);

		if (deploymentsShellResult?.code !== 0) {
			console.warn(`Failed to get deployments from "${context}" context to determine the cluster type.`);
			return ClusterProvider.Unknown;
		}

		const deployments: DeploymentResult | undefined = parseJson(deploymentsShellResult.stdout);
		if (!deployments) {
			return ClusterProvider.Unknown;
		}

		if (deployments.items.length === 10 &&
			deployments.items.every(deployment => deployment.status.conditions?.[0].type === 'Available')) {
			return ClusterProvider.AzureARC;
		}

		return ClusterProvider.Generic;
	}

	/**
	 * Return kubectl version (client + server) in json format.
	 */
	async getKubectlVersion(): Promise<KubectlVersionResult | undefined> {
		const shellResult = await this.invokeKubectlCommand('version -o json');
		if (!shellResult) {
			return;
		}
		if (shellResult.code === 0) {
			return parseJson(shellResult.stdout);
		}
	}

	/**
	 * Gets resource Uri for loading kubernetes resource config in vscode editor.
	 *
	 * @see https://github.com/Azure/vscode-kubernetes-tools/blob/master/src/kuberesources.virtualfs.ts
	 *
	 * @param namespace Resource namespace.
	 * @param resourceName Resource name.
	 * @param documentFormat Resource document format.
	 * @param action Resource Uri action.
	 * @returns
	 */
	getResourceUri(
		namespace: string | null | undefined,
		resourceName: string | undefined,
		documentFormat: string,
		action?: string,
	): Uri {

		// determine resource file extension
		let fileExtension = '';
		if (documentFormat !== '') {
			fileExtension = `.${documentFormat}`;
		}

		// create virtual document file name with extension
		const documentName = `${resourceName?.replace('/', '-')}${fileExtension}`;

		// determine virtual resource file scheme
		let scheme = KubernetesFileSchemes.Resource;
		if (action === 'describe') {
			scheme = KubernetesFileSchemes.ReadonlyResource;
		}

		// determine virtual resource file authority
		let authority: string = KubernetesFileSchemes.KubectlResource;
		if (action === 'describe') {
			authority = KubernetesFileSchemes.DescribeResource;
		}

		// set namespace query param
		let namespaceQuery = '';
		if (namespace) {
			namespaceQuery = `ns=${namespace}&`;
		}

		// create resource url
		const nonce: number = new Date().getTime();
		const url = `${scheme}://${authority}/${documentName}?${namespaceQuery}value=${resourceName}&_=${nonce}`;

		// create resource uri
		return Uri.parse(url);
	}

}

export const kubernetesTools = new KubernetesTools();
