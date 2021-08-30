import { window } from 'vscode';
import { extension } from 'vscode-kubernetes-tools-api';

export async function kubectlProvider() {
	const kubectlProvider = await extension.kubectl.v1;
	if (!kubectlProvider.available) {
		window.showErrorMessage(`kubectl provider API is unavailable ${kubectlProvider.reason}`);
		return;
	}
	return kubectlProvider.api;
}

export async function kubectlCluster() {
	const kubectlApi = await kubectlProvider();
	if (!kubectlApi) {
		return;
	}
	const kubectlConfigValue = await kubectlConfig();
	if (!kubectlConfigValue) {
		return;
	}
	return kubectlConfigValue.clusters;
}

export async function kubectlConfig(): Promise<undefined | Kubeconfig> {
  const kubectl = await kubectlProvider();
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

export async function kubectlKustomization(): Promise<undefined | Kustomize> {
	const kubectl = await kubectlProvider();
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

export async function kubectlHelmRelease(): Promise<undefined | HelmRelease> {
	const kubectl = await kubectlProvider();
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

export async function kubectlGitRepository(): Promise<undefined | GitRepository> {
	const kubectl = await kubectlProvider();
	if (!kubectl) {
		return;
	}
	const gitRepositoryShellResult = await kubectl.invokeCommand(outputJSON('get GitRepository -A'));
	if (!gitRepositoryShellResult || gitRepositoryShellResult.stderr) {
		console.warn(`Failed to get cubectl git releases ${gitRepositoryShellResult?.stderr}`);
    return;
	}
	return parseJSONOutput(gitRepositoryShellResult.stdout);
}

export async function kubectlHelmRepository(): Promise<undefined | HelmRepository> {
	const kubectl = await kubectlProvider();
	if (!kubectl) {
		return;
	}
	const helmRepositoryShellResult = await kubectl.invokeCommand(outputJSON('get HelmRepository -A'));
	if (!helmRepositoryShellResult || helmRepositoryShellResult.stderr) {
		console.warn(`Failed to get cubectl helm releases ${helmRepositoryShellResult?.stderr}`);
    return;
	}
	return parseJSONOutput(helmRepositoryShellResult.stdout);
}

export async function kubectlBucket(): Promise<undefined | Bucket> {
	const kubectl = await kubectlProvider();
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

interface Kubeconfig {
	readonly apiVersion: string;
	readonly 'current-context': string;
	readonly clusters: {
		readonly name: string;
		readonly cluster: {
			readonly server: string;
			readonly 'certificate-authority'?: string;
			readonly 'certificate-authority-data'?: string;
		};
	}[] | undefined;
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

interface Kustomize {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: {
		readonly apiVersion: string;
		readonly kind: 'Kustomization'
		readonly metadata: ResourceMetadata;
	}[];
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
	readonly metadata: ItemMetadata;
}

interface Bucket {
	readonly apiVersion: string;
	// TODO: fill
}

interface HelmRelease {
	readonly apiVersion: string;
	readonly kind: 'HelmRelease';
	readonly metadata: {
		// TODO: fill
	}
}

interface GitRepository {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: {
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
	}[];
	readonly metadata: ItemMetadata;
}

interface HelmRepository {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly metadata: ItemMetadata;
	// TODO: fill
}

interface ResourceMetadata {
	readonly annotations: {
		'kubectl.kubernetes.io/last-applied-configuration': string;
	};
	readonly creationTimestamp: string;
	readonly finalizers: Array<string>;
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

type Conditions = Array<{
	readonly lastTransitionTime: string;
	readonly message: string;
	readonly reason: string;
	readonly status: string;
	readonly type: string;
}>;
