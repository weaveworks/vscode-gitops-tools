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

    return;
  }
  clusterProviderApi = clusterProvider.api;
  return clusterProviderApi;
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


interface HelmRelease {
	readonly apiVersion: string;
	readonly kind: 'HelmRelease';
	readonly metadata: {
		// TODO: fill
	}
}

