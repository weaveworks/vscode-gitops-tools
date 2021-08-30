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

    return;
  }
  clusterProviderApi = clusterProvider.api;
  return clusterProviderApi;
}

let kubectlProviderApi: KubectlV1;
export async function kubectlProvider() {
	if (kubectlProviderApi) {
		return kubectlProviderApi;
	}
	const kubectlProvider = await extension.kubectl.v1;
	if (!kubectlProvider.available) {
		window.showErrorMessage(`kubectl provider API is unavailable ${kubectlProvider.reason}`);
		return;
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

}
