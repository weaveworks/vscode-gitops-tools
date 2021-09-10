import { window } from 'vscode';
import { extension } from 'vscode-kubernetes-tools-api';
import { setContext, ContextTypes } from '../context';
import { BucketResult } from './bucket';
import { KubernetesConfig } from './kubernetesConfig';
import { GitRepositoryResult } from './gitRepository';
import { HelmReleaseResult } from './helmRelease';
import { HelmRepositoryResult } from './helmRepository';
import { KustomizeResult } from './kustomize';
import { parseJson } from '../utils/jsonUtils';


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
		const kubectl = await extension.kubectl.v1;
		if (!kubectl.available) {
			window.showErrorMessage(`Kubernetes Tools Kubectl API is unavailable: ${kubectl.reason}`);
			return;
		}
		return kubectl.api;
	}

	/**
	 * Gets current kubectl config with available contexts and clusters.
	 */
	async getKubectlConfig(): Promise<undefined | KubernetesConfig> {
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}
		const configShellResult = await kubectl.invokeCommand('config view -o json');
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
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}

		const currentContextShellResult = await kubectl.invokeCommand('config current-context');
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
	 * @returns True if kubectl context was changed, and false or undefined otherwise.
	 */
	async setCurrentContext(contextName: string): Promise<undefined | boolean> {
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}

		const currentContext = await this.getCurrentContext();
		if (currentContext && currentContext === contextName) {
			return;
		}

		const setContextShellResult = await kubectl.invokeCommand(`config use-context ${contextName}`);
		if (setContextShellResult?.stderr) {
			window.showErrorMessage(`Failed to set kubectl context to ${contextName}: ${setContextShellResult?.stderr}`);
			return;
		}

		setContext(ContextTypes.NoClusterSelected, false);
		return true;
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
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}

		const kustomizationShellResult = await kubectl.invokeCommand('get Kustomization -A -o json');
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
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}

		const helmReleaseShellResult = await kubectl.invokeCommand('get HelmRelease -A -o json');
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
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}

		const gitRepositoryShellResult = await kubectl.invokeCommand('get GitRepository -A -o json');
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
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}

		const helmRepositoryShellResult = await kubectl.invokeCommand('get HelmRepository -A -o json');
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
		const kubectl = await this.getKubectlApi();
		if (!kubectl) {
			return;
		}

		const bucketShellResult = await kubectl.invokeCommand('get Bucket -A -o json');
		if (!bucketShellResult || bucketShellResult.stderr) {
			console.warn(`Failed to get kubectl buckets: ${bucketShellResult?.stderr}`);
			return;
		}

		return parseJson(bucketShellResult.stdout);
	}
}

export const kubernetesTools = new KubernetesTools();
