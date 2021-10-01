import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node';
import { Uri, window } from 'vscode';
import * as kubernetes from 'vscode-kubernetes-tools-api';
import { ContextTypes, setContext } from '../context';
import { parseJson } from '../utils/jsonUtils';
import { BucketResult } from './bucket';
import { DeploymentResult } from './deployment';
import { GitRepositoryResult } from './gitRepository';
import { HelmReleaseResult } from './helmRelease';
import { HelmRepositoryResult } from './helmRepository';
import { KubernetesConfig } from './kubernetesConfig';
import { KubernetesFileSchemes } from './kubernetesFileSchemes';
import { KustomizeResult } from './kustomize';
import { NamespaceResult } from './namespace';


/**
 * Defines Kubernetes Tools class for integration
 * with Microsoft Kubernetes Tools extension API.
 * @see https://github.com/Azure/vscode-kubernetes-tools
 * @see https://github.com/Azure/vscode-kubernetes-tools-api
 */
class KubernetesTools {

	/**
	 * Gets kubernetes tools extension kubectl api reference.
	 * @see https://github.com/Azure/vscode-kubernetes-tools-api
	 */
	async getKubectlApi() {
		const kubectl = await kubernetes.extension.kubectl.v1;
		if (!kubectl.available) {
			window.showErrorMessage(`Kubernetes Tools Kubectl API is unavailable: ${kubectl.reason}`);
			return;
		}
		return kubectl.api;
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
		return await kubectl.invokeCommand(command);
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
	async getFluxDeployments(): Promise<undefined | DeploymentResult> {
		const fluxDeploymentShellResult = await this.invokeKubectlCommand('get deployment --namespace=flux-system -o json');
		if (!fluxDeploymentShellResult || fluxDeploymentShellResult.stderr) {
			console.warn(`Failed to get flux system deployments: ${fluxDeploymentShellResult?.stderr}`);
			return;
		}
		return parseJson(fluxDeploymentShellResult.stdout);
	}

	/**
	 * Return true if flux enabled in the current cluster.
	 * Function checks if cluster contains `flux-system` namespace.
	 * @param clusterName target cluster name
	 */
	async isFluxInstalled(clusterName: string) {
		const namespacesShellResult = await this.invokeKubectlCommand(`get ns --context ${clusterName} -o json`);
		if (!namespacesShellResult || namespacesShellResult.stderr) {
			console.warn(`Failed to get namespaces: ${namespacesShellResult?.stderr}`);
			return;
		}
		const namespaces: NamespaceResult = parseJson(namespacesShellResult.stdout);
		return namespaces.items.some(namespace => namespace.metadata.name === 'flux-system');
	}

	/**
	 * Return all available kubernetes resource kinds.
	 */
	async getAvailableResourceKinds(): Promise<string[] | undefined> {
		const kindsShellResult = await this.invokeKubectlCommand('api-resources --verbs=list -o name');
		if (!kindsShellResult || kindsShellResult.stderr) {
			console.warn(`Failed to get resource kinds: ${kindsShellResult?.stderr}`);
			return;
		}
		const kinds = kindsShellResult.stdout
			.split('\n')
			.filter(kind => kind.length);
		return kinds;
	}

	/**
	 * Return all kubernetes resources that were created by a kustomize.
	 * @param kustomizeName name of the kustomize object
	 * @param kustomizeNamespace namespace of the kustomize object
	 */
	async getChildrenOfKustomization(kustomizeName: string, kustomizeNamespace: string): Promise<KubernetesListObject<KubernetesObject> | undefined> {
		const resourceKinds = await this.getAvailableResourceKinds();
		if (!resourceKinds) {
			return;
		}
		const query = `get ${resourceKinds.join(',')} -l kustomize.toolkit.fluxcd.io/name=${kustomizeName} -n ${kustomizeNamespace} -o json`;
		const resourcesShellResult = await this.invokeKubectlCommand(query);
		if (!resourcesShellResult || resourcesShellResult.code !== 0) {
			window.showErrorMessage(`Failed to get kustomization created resources: ${resourcesShellResult?.stderr}`);
			return undefined;
		}

		return parseJson(resourcesShellResult.stdout);
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
	getResourceUri(namespace: string | null | undefined,
		resourceName: string | undefined,
		documentFormat: string,
		action?: string): Uri {

		// determine resource file extension
		let fileExtension: string = '';
		if (documentFormat !== '') {
			fileExtension = `.${documentFormat}`;
		}

		// create virtual document file name with extension
		const documentName: string = `${resourceName?.replace('/', '-')}${fileExtension}`;

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
		let namespaceQuery: string = '';
		if (namespace) {
			namespaceQuery = `ns=${namespace}&`;
		}

		// create resource url
		const nonce: number = new Date().getTime();
		const url: string = `${scheme}://${authority}/${documentName}?${namespaceQuery}value=${resourceName}&_=${nonce}`;
		// console.debug(`gitops.kubernetesTools.getResourceUri: ${url}`);

		// create resource uri
		return Uri.parse(url);
	}

}

export const kubernetesTools = new KubernetesTools();
