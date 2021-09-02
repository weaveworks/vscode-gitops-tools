import { window } from 'vscode';
import { extension } from 'vscode-kubernetes-tools-api';

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
	async getKubectlConfig(): Promise<undefined | Kubeconfig> {
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
			return;
		}
		return currentContextShellResult.stdout.trim();
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
	async getKustomizations(): Promise<undefined | Kustomize> {
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
	async getHelmReleases(): Promise<undefined | HelmRelease> {
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
	async getGitRepositories(): Promise<undefined | GitRepository> {
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
	async getHelmRepositories(): Promise<undefined | HelmRepository> {
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
	async getBuckets(): Promise<undefined | Bucket> {
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

export interface ClusterType {
	readonly name: string;
	readonly cluster: {
		readonly server: string;
		readonly 'certificate-authority'?: string;
		readonly 'certificate-authority-data'?: string;
	};
}

export interface Kubeconfig {
	readonly apiVersion: string;
	readonly 'current-context': string;
	readonly clusters: ClusterType[] | undefined;
	readonly contexts: {
		readonly name: string;
		readonly context: {
			readonly cluster: string;
			readonly user: string;
			readonly namespace?: string;
		};
	}[] | undefined;
	readonly users: {
		readonly name: string;
		readonly user: Record<string, unknown>;
	}[] | undefined;
}

export interface Kustomize {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: KustomizeItem[];
	readonly metadata: ItemMetadata;
}
export interface KustomizeItem {
	readonly apiVersion: string;
	readonly kind: 'Kustomization'
	readonly metadata: ResourceMetadata;
	readonly spec: {
		readonly force: boolean;
		readonly interval: string;
		readonly path: string;
		readonly prune: boolean;
		readonly sourceRef: {
			readonly kind: string;
			readonly name: string;
		}
	}
	readonly status: {
		readonly conditions: Conditions;
		readonly lastAppliedRevision: string;
		readonly lastAttemptedRevision: string;
		readonly observedGeneration: number;
		readonly snapshot: {
			readonly checksum: string;
			readonly entries: {
				readonly kinds: {
					[key: string]: string;
				}
			}[]
		}
	}
}
// Perhaps type can be found at https://fluxcd.io/docs/components/source/buckets/
interface Bucket {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: BucketItem[];
	readonly metadata: ItemMetadata;
}
export interface BucketItem {
	readonly apiVersion: string;
	readonly kind: 'Bucket';
	readonly metadata: ResourceMetadata;
	readonly spec: {
		readonly bucketName: string;
		readonly endpoint: string;
		readonly interval: string;
		readonly insecure?: boolean;
		readonly provider?: string;
		readonly timeout?: string;
	}
	readonly status: unknown;
}

interface HelmRelease {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: HelmReleaseItem[];
	readonly metadata: ItemMetadata;
}
export interface HelmReleaseItem {
	readonly apiVersion: string;
	readonly kind: "HelmRelease",
	readonly metadata: ResourceMetadata;
	// TODO: use types from somewhere instead of manually writing them
}

interface GitRepository {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: GitRepositoryItem[];
	readonly metadata: ItemMetadata;
}
export interface GitRepositoryItem {
	readonly apiVersion: string;
	readonly kind: 'GitRepository';
	readonly metadata: ResourceMetadata;
	readonly spec: {
		readonly gitImplementation: string;
		readonly interval: string;
		readonly ref: {
			branch: string;
		}
		readonly timeout: string;
		readonly url: string;
	}
	readonly status: {
		readonly artifact: {
			readonly checksum: string;
			readonly lastUpdateTime: string;
			readonly path: string;
			readonly revision: string;
			readonly url: string;
		}
		readonly conditions: Conditions;
		readonly observedGeneration: number;
	}
}

interface HelmRepository {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: HelmRepositoryItem[]
	readonly metadata: ItemMetadata;
}
export interface HelmRepositoryItem {
	readonly apiVersion: string;
	readonly kind: 'HelmRepository';
	readonly metadata: ResourceMetadata;
	// TODO: search for types
}

interface ResourceMetadata {
	readonly annotations: {
		'kubectl.kubernetes.io/last-applied-configuration': string;
	};
	readonly creationTimestamp: string;
	readonly finalizers: string[];
	readonly generation: number;
	readonly name: string;
	readonly namespace: string;
	readonly resourceVersion: string;
	readonly uid: string;
}

interface ItemMetadata {
	readonly resourceVersion: '';
	readonly selfLink: '';
}

type Conditions = {
	readonly lastTransitionTime: string;
	readonly message: string;
	readonly reason: string;
	readonly status: string;
	readonly type: string;
}[];
