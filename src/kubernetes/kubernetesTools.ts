import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node';
import { Uri, window } from 'vscode';
import * as kubernetes from 'vscode-kubernetes-tools-api';
import { AzureConstants } from '../azure/azureTools';
import { Errorable, failed, succeeded } from '../errorable';
import { globalState, telemetry } from '../extension';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { output } from '../output';
import { shellCodeError } from '../shell';
import { TelemetryErrorEventNames } from '../telemetry';
import { parseJson } from '../utils/jsonUtils';
import { ContextTypes, setVSCodeContext } from '../vscodeContext';
import { BucketResult } from './bucket';
import { GitRepositoryResult } from './gitRepository';
import { HelmReleaseResult } from './helmRelease';
import { HelmRepositoryResult } from './helmRepository';
import { KubernetesConfig, KubernetesContextWithCluster } from './kubernetesConfig';
import { KubernetesFileSchemes } from './kubernetesFileSchemes';
import { ClusterProvider, ConfigMap, DeploymentResult, NamespaceResult, NodeResult, PodResult } from './kubernetesTypes';
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
	 * RegExp for the Error that should not be sent in telemetry.
	 * Server doesn't have a resource type = when GitOps not enabled
	 * No connection could be made... = when cluster not running
	 */
	private notAnErrorServerDoesntHaveResourceTypeRegExp = /the server doesn't have a resource type/i;
	private notAnErrorServerNotRunning = /no connection could be made because the target machine actively refused it/i;
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
			telemetry.sendError(TelemetryErrorEventNames.KUBERNETES_TOOLS_API_UNAVAILABLE, new Error(kubectl.reason));
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

		output.send(`> kubectl ${command}`, {
			channelName: 'GitOps: kubectl',
			newline: 'single',
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
	async getKubectlConfig(): Promise<Errorable<KubernetesConfig>> {
		const configShellResult = await this.invokeKubectlCommand('config view -o json');

		if (configShellResult?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_KUBECTL_CONFIG);
			return {
				succeeded: false,
				error: [shellCodeError(configShellResult)],
			};
		}

		const kubectlConfig = parseJson(configShellResult.stdout);
		return {
			succeeded: true,
			result: kubectlConfig,
		};
	}

	/**
	 * Gets current kubectl context name.
	 */
	async getCurrentContext(): Promise<Errorable<string>> {

		const currentContextShellResult = await this.invokeKubectlCommand('config current-context');
		if (currentContextShellResult?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_CURRENT_KUBERNETES_CONTEXT);
			console.warn(`Failed to get current kubectl context: ${currentContextShellResult?.stderr}`);
			setVSCodeContext(ContextTypes.NoClusterSelected, true);
			return {
				succeeded: false,
				error: [`${currentContextShellResult?.code || ''} ${currentContextShellResult?.stderr}`],
			};
		}

		const currentContext = currentContextShellResult.stdout.trim();
		setVSCodeContext(ContextTypes.NoClusterSelected, false);

		return {
			succeeded: true,
			result: currentContext,
		};
	}

	/**
	 * Sets current kubectl context.
	 * @param contextName Kubectl context name to use.
	 * @returns `undefined` in case of an error or Object with information about
	 * whether or not context was switched or didn't need it (current).
	 */
	async setCurrentContext(contextName: string): Promise<undefined | { isChanged: boolean;	}> {
		const currentContextResult = await this.getCurrentContext();
		if (succeeded(currentContextResult) && currentContextResult.result === contextName) {
			return {
				isChanged: false,
			};
		}

		const setContextShellResult = await this.invokeKubectlCommand(`config use-context ${contextName}`);
		if (setContextShellResult?.stderr) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_SET_CURRENT_KUBERNETES_CONTEXT);
			window.showErrorMessage(`Failed to set kubectl context to ${contextName}: ${setContextShellResult?.stderr}`);
			return;
		}

		setVSCodeContext(ContextTypes.NoClusterSelected, false);
		setVSCodeContext(ContextTypes.CurrentClusterGitOpsNotEnabled, false);
		setVSCodeContext(ContextTypes.NoSources, false);
		setVSCodeContext(ContextTypes.NoWorkloads, false);
		setVSCodeContext(ContextTypes.FailedToLoadClusterContexts, false);
		this.clusterSupportedResourceKinds = undefined;

		// TODO: maybe emit an event?
		checkIfOpenedFolderGitRepositorySourceExists();

		return {
			isChanged: true,
		};
	}

	/**
	 * Get a list of contexts from kubeconfig.
	 * Also add cluster info to the context objects.
	 */
	async getContexts(): Promise<Errorable<KubernetesContextWithCluster[]>> {
		const kubectlConfig = await this.getKubectlConfig();

		if (failed(kubectlConfig)) {
			return {
				succeeded: false,
				error: kubectlConfig.error,
			};
		}
		if (!kubectlConfig.result.contexts) {
			return {
				succeeded: false,
				error: ['Config fetched, but contexts not found.'],
			};
		}

		const contexts: KubernetesContextWithCluster[] = kubectlConfig.result.contexts.map((context: KubernetesContextWithCluster) => {
			const clusterInfo = kubectlConfig.result.clusters?.find(cluster => cluster.name === context.context.cluster);
			if (clusterInfo) {
				context.context.clusterInfo = clusterInfo;
			}
			return context;
		});

		return {
			succeeded: true,
			result: contexts,
		};
	}

	async getClusterName(contextName: string): Promise<string> {
		const contexts = await this.getContexts();
		if(contexts.succeeded === true) {
			return contexts.result.find(context => context.name === contextName)?.context.clusterInfo?.name || contextName;
		} else {
			return contextName;
		}
	}


	/**
	 * Get pods by a deployment name.
	 * @param name pod target name
	 * @param namespace pod target namespace
	 */
	async getPodsOfADeployment(name = '', namespace = ''): Promise<undefined | PodResult> {
		let nameArg: string;

		if (name === 'fluxconfig-agent' || name === 'fluxconfig-controller') {
			nameArg = name ? `-l app.kubernetes.io/component=${name}` : '';
		} else {
			nameArg = name ? `-l app=${name}` : '';
		}

		let namespaceArg = '';
		if (namespace === 'all') {
			namespaceArg = '--all-namespaces';
		} else if (namespace.length > 0) {
			namespaceArg = `--namespace=${namespace}`;
		}

		const podResult = await this.invokeKubectlCommand(`get pod ${nameArg} ${namespaceArg} -o json`);

		if (podResult?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_PODS_OF_A_DEPLOYMENT);
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
		if (kustomizationShellResult?.code !== 0) {
			console.warn(`Failed to get kubectl kustomizations: ${kustomizationShellResult?.stderr}`);
			if (kustomizationShellResult?.stderr && !this.notAnErrorServerDoesntHaveResourceTypeRegExp.test(kustomizationShellResult.stderr)) {
				telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_KUSTOMIZATIONS);
			}
			return;
		}
		return parseJson(kustomizationShellResult.stdout);
	}

	/**
	 * Gets all helm releases from the current kubectl context.
	 */
	async getHelmReleases(): Promise<undefined | HelmReleaseResult> {
		const helmReleaseShellResult = await this.invokeKubectlCommand('get HelmRelease -A -o json');
		if (helmReleaseShellResult?.code !== 0) {
			console.warn(`Failed to get kubectl helm releases: ${helmReleaseShellResult?.stderr}`);
			if (helmReleaseShellResult?.stderr && !this.notAnErrorServerDoesntHaveResourceTypeRegExp.test(helmReleaseShellResult.stderr)) {
				telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_HELM_RELEASES);
			}
			return;
		}
		return parseJson(helmReleaseShellResult.stdout);
	}

	/**
	 * Gets all git repositories for the current kubectl context.
	 */
	async getGitRepositories(): Promise<undefined | GitRepositoryResult> {
		const gitRepositoryShellResult = await this.invokeKubectlCommand('get GitRepository -A -o json');
		if (gitRepositoryShellResult?.code !== 0) {
			console.warn(`Failed to get kubectl git repositories: ${gitRepositoryShellResult?.stderr}`);
			if (gitRepositoryShellResult?.stderr && !this.notAnErrorServerDoesntHaveResourceTypeRegExp.test(gitRepositoryShellResult.stderr)) {
				telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_GIT_REPOSITORIES);
			}
			return;
		}
		return parseJson(gitRepositoryShellResult.stdout);
	}

	/**
	 * Gets all helm repositories for the current kubectl context.
	 */
	async getHelmRepositories(): Promise<undefined | HelmRepositoryResult> {
		const helmRepositoryShellResult = await this.invokeKubectlCommand('get HelmRepository -A -o json');
		if (helmRepositoryShellResult?.code !== 0) {
			console.warn(`Failed to get kubectl helm repositories: ${helmRepositoryShellResult?.stderr}`);
			if (helmRepositoryShellResult?.stderr && !this.notAnErrorServerDoesntHaveResourceTypeRegExp.test(helmRepositoryShellResult.stderr)) {
				telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_HELM_REPOSITORIES);
			}
			return;
		}
		return parseJson(helmRepositoryShellResult.stdout);
	}

	/**
	 * Gets all buckets for the current kubectl context.
	 */
	async getBuckets(): Promise<undefined | BucketResult> {
		const bucketShellResult = await this.invokeKubectlCommand('get Bucket -A -o json');
		if (bucketShellResult?.code !== 0) {
			console.warn(`Failed to get kubectl buckets: ${bucketShellResult?.stderr}`);
			if (bucketShellResult?.stderr && !this.notAnErrorServerDoesntHaveResourceTypeRegExp.test(bucketShellResult.stderr)) {
				telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_BUCKETS);
			}
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
			if (fluxDeploymentShellResult?.stderr && !this.notAnErrorServerNotRunning.test(fluxDeploymentShellResult.stderr)) {
				telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_FLUX_CONTROLLERS);
			}
			return;
		}

		return parseJson(fluxDeploymentShellResult.stdout);
	}

	/**
	 * Return true if gitops is enabled in the current cluster.
	 * Function checks if `flux-system` namespace contains flux controllers.
	 * @param contextName target cluster name
	 */
	async isGitOpsEnabled(contextName: string) {
		const fluxControllers = await this.getFluxControllers(contextName);

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
		if (kindsShellResult?.code !== 0) {
			this.clusterSupportedResourceKinds = undefined;
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_AVAILABLE_RESOURCE_KINDS);
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
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_CHILDREN_OF_A_WORKLOAD);
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
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_NAMESPACES);
			window.showErrorMessage(`Failed to get namespaces ${namespacesShellResult?.stderr}`);
			return;
		}

		return parseJson(namespacesShellResult.stdout);
	}

	/**
	 * Try to detect known cluster providers. Returns user selected cluster type if that is set.
	 * @param context target context to get resources from.
	 * TODO: maybe use Errorable?
	 */
	async detectClusterProvider(context: string): Promise<ClusterProvider> {
		const clusterMetadata = await globalState.getContextClusterMetadata(context);
		if(clusterMetadata?.clusterProvider) {
			return clusterMetadata.clusterProvider;
		}

		const tryProviderAzureARC = await this.isClusterAzureARC(context);
		if (tryProviderAzureARC === ClusterProvider.AzureARC) {
			return ClusterProvider.AzureARC;
		} else if (tryProviderAzureARC === ClusterProvider.DetectionFailed) {
			return ClusterProvider.DetectionFailed;
		}

		const tryProviderAKS = await this.isClusterAKS(context);
		if (tryProviderAKS === ClusterProvider.AKS) {
			return ClusterProvider.AKS;
		} else if (tryProviderAKS === ClusterProvider.DetectionFailed) {
			return ClusterProvider.DetectionFailed;
		}

		return ClusterProvider.Generic;
	}

	/**
	 * Try to determine if the cluster is AKS or not.
	 * @param context target context to get resources from.
	 */
	private async isClusterAKS(context: string): Promise<ClusterProvider> {
		const nodesShellResult = await this.invokeKubectlCommand(`get nodes --context=${context} -o json`);

		if (nodesShellResult?.code !== 0) {
			console.warn(`Failed to get nodes from "${context}" context to determine the cluster type. ${nodesShellResult?.stderr}`);
			if (nodesShellResult?.stderr && !this.notAnErrorServerNotRunning.test(nodesShellResult.stderr)) {
				telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_NODES_TO_DETECT_AKS_CLUSTER);
			}
			return ClusterProvider.DetectionFailed;
		}

		const nodes: NodeResult | undefined = parseJson(nodesShellResult.stdout);
		if (!nodes) {
			return ClusterProvider.DetectionFailed;
		}
		const firstNode = nodes.items[0];

		if (!firstNode) {
			console.warn(`No nodes in the "${context}" context to determine the cluster type.`);
			return ClusterProvider.DetectionFailed;
		}

		const providerID = firstNode.spec?.providerID;

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
	private async isClusterAzureARC(context: string): Promise<ClusterProvider> {
		const configmapShellResult = await this.invokeKubectlCommand(`get configmaps azure-clusterconfig -n ${AzureConstants.ArcNamespace} --context=${context} --ignore-not-found -o json`);

		if (configmapShellResult?.code !== 0) {
			if (configmapShellResult?.stderr && !this.notAnErrorServerNotRunning.test(configmapShellResult.stderr)) {
				telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_CONFIGMAPS_TO_DETECT_ARC_CLUSTER);
			}
			console.warn(`Failed to get configmaps from "${context}" context to determine the cluster type. ${configmapShellResult?.stderr}`);
			return ClusterProvider.DetectionFailed;
		}

		const stdout = configmapShellResult.stdout;
		if (stdout.length) {
			const azureClusterconfigConfigMap: ConfigMap | undefined = parseJson(stdout);
			if (azureClusterconfigConfigMap === undefined) {
				return ClusterProvider.DetectionFailed;
			} else {
				return ClusterProvider.AzureARC;
			}
		}

		return ClusterProvider.Generic;
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

	/**
	 * Get one resource object by kind/name and namespace
	 * @param name name of the target resource
	 * @param namespace namespace of the target resource
	 * @param kind kind of the target resource
	 */
	async getResource(name: string, namespace: string, kind: string): Promise<undefined | KubernetesObject> {
		const resourceShellResult = await this.invokeKubectlCommand(`get ${kind}/${name} --namespace=${namespace} -o json`);
		if (resourceShellResult?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_GET_RESOURCE);
			return;
		}

		return parseJson(resourceShellResult.stdout);
	}

}

export const kubernetesTools = new KubernetesTools();
