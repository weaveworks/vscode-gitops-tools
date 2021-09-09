import { window } from 'vscode';
import { extension } from 'vscode-kubernetes-tools-api';
import { setContext, ContextTypes } from '../context';
import { BucketResult } from './kubernetesBucket';
import { KubernetesConfig } from './kubernetesConfig';
import { GitRepositoryResult } from './kubernetesGitRepository';
import { HelmReleaseResult } from './kubernetesHelmRelease';
import { HelmRepositoryResult } from './kubernetesHelmRepository';
import { KustomizeResult } from './kubernetesKustomize';

class KubernetesTools {
	/**
	 * Fetch kubectl api provider from the upstream extension `ms-kubernetes-tools.vscode-kubernetes-tools`
	 */
	async getProvider() {
		const kubectlProvider = await extension.kubectl.v1;
		if (!kubectlProvider.available) {
			window.showErrorMessage(`kubectl provider API is unavailable ${kubectlProvider.reason}`);
			return;
		}
		return kubectlProvider.api;
	}
	/**
	 * Return k8s config with contexts and clusters.
	 */
	async getKubectlConfig(): Promise<undefined | KubernetesConfig> {
		const kubectl = await this.getProvider();
		if (!kubectl) {
			return;
		}
		const configShellResult = await kubectl.invokeCommand(outputJSON('config view'));
		if (!configShellResult || configShellResult.stderr) {
			console.warn(`Failed to get cubectl config ${configShellResult?.stderr}`);
			return;
		}
		return parseJSONOutput(configShellResult.stdout);
	}
	/**
	 * Return k8s current config context name.
	 */
	async getCurrentContext(): Promise<undefined | string> {
		const kubectl = await this.getProvider();
		if (!kubectl) {
			return;
		}
		const currentContextShellResult = await kubectl.invokeCommand('config current-context');
		if (!currentContextShellResult || currentContextShellResult.stderr) {
			console.warn(`Failed to get cubectl current context ${currentContextShellResult?.stderr}`);
			setContext(ContextTypes.NoClusterSelected, true);
			return;
		}
		const currentContext = currentContextShellResult.stdout.trim();
		setContext(ContextTypes.NoClusterSelected, !currentContext);
		return currentContext;
	}
	/**
	 * Switch current k8s config context.
	 */
	async setCurrentContext(contextName: string): Promise<undefined | boolean> {
		const kubectl = await this.getProvider();
		if (!kubectl) {
			return;
		}
		const currentContext = await this.getCurrentContext();
		if (currentContext && currentContext === contextName) {
			return;
		}
		const setContextShellResult = await kubectl.invokeCommand(`config use-context ${contextName}`);
		if (setContextShellResult?.stderr) {
			window.showErrorMessage(`Failed to switch the active context ${setContextShellResult?.stderr}`);
			return;
		}
		setContext(ContextTypes.NoClusterSelected, false);
		return true;
	}
	/**
	 * Return all k8s clusters.
	 */
	async getClusters() {
		const kubectlConfigValue = await this.getKubectlConfig();
		if (!kubectlConfigValue) {
			return;
		}
		return kubectlConfigValue.clusters;
	}
	/**
	 * Return all kustomizations from all namespaces.
	 */
	async getKustomizations(): Promise<undefined | KustomizeResult> {
		const kubectl = await this.getProvider();
		if (!kubectl) {
			return;
		}
		const kustomizationShellResult = await kubectl.invokeCommand(outputJSON('get Kustomization -A'));
		if (!kustomizationShellResult || kustomizationShellResult.stderr) {
			console.warn(`Failed to get cubectl kustomizations ${kustomizationShellResult?.stderr}`);
			return;
		}
		return parseJSONOutput(kustomizationShellResult.stdout);
	}
	/**
	 * Return all helm releases from all namespaces.
	 */
	async getHelmReleases(): Promise<undefined | HelmReleaseResult> {
		const kubectl = await this.getProvider();
		if (!kubectl) {
			return;
		}
		const helmReleaseShellResult = await kubectl.invokeCommand(outputJSON('get HelmRelease -A'));
		if (!helmReleaseShellResult || helmReleaseShellResult.stderr) {
			console.warn(`Failed to get cubectl helm releases ${helmReleaseShellResult?.stderr}`);
			return;
		}
		return parseJSONOutput(helmReleaseShellResult.stdout);
	}
	/**
	 * Return all git repositories from all namespaces.
	 */
	async getGitRepositories(): Promise<undefined | GitRepositoryResult> {
		const kubectl = await this.getProvider();
		if (!kubectl) {
			return;
		}
		const gitRepositoryShellResult = await kubectl.invokeCommand(outputJSON('get GitRepository -A'));
		if (!gitRepositoryShellResult || gitRepositoryShellResult.stderr) {
			console.warn(`Failed to get cubectl git repository ${gitRepositoryShellResult?.stderr}`);
			return;
		}
		return parseJSONOutput(gitRepositoryShellResult.stdout);
	}
	/**
	 * Return all helm repositories from all namespaces.
	 */
	async getHelmRepositories(): Promise<undefined | HelmRepositoryResult> {
		const kubectl = await this.getProvider();
		if (!kubectl) {
			return;
		}
		const helmRepositoryShellResult = await kubectl.invokeCommand(outputJSON('get HelmRepository -A'));
		if (!helmRepositoryShellResult || helmRepositoryShellResult.stderr) {
			console.warn(`Failed to get cubectl helm repository ${helmRepositoryShellResult?.stderr}`);
			return;
		}
		return parseJSONOutput(helmRepositoryShellResult.stdout);
	}
	/**
	 * Return all buckets from all namespaces.
	 */
	async getBuckets(): Promise<undefined | BucketResult> {
		const kubectl = await this.getProvider();
		if (!kubectl) {
			return;
		}
		const bucketShellResult = await kubectl.invokeCommand(outputJSON('get Bucket -A'));
		if (!bucketShellResult || bucketShellResult.stderr) {
			console.warn(`Failed to get cubectl buckets ${bucketShellResult?.stderr}`);
			return;
		}
		return parseJSONOutput(bucketShellResult.stdout);
	}
}

export const kubernetesTools = new KubernetesTools();

function outputJSON(kubectlCommand: string) {
  return `${kubectlCommand} -o json`;
}

export function parseJSONOutput(output: string) {
	let parsedJson;
	try {
		parsedJson = JSON.parse(output.trim());
	} catch(e) {
		console.warn(`JSON.parse() failed ${e}`);
		return;
	}
  return parsedJson;
}

