import { window } from 'vscode';
import { ClusterProviderV1, extension, KubectlV1 } from 'vscode-kubernetes-tools-api';

let clusterProviderApi: ClusterProviderV1;
export async function clusterProvider() {
  if (clusterProviderApi) {
    return clusterProviderApi;
  }
  const clusterProvider = await extension.clusterProvider.v1;
  if (!clusterProvider.available) {
    window.showErrorMessage(`Cluster provider API is unavailable ${clusterProvider.reason}`);
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
	kubectlProviderApi = kubectlProvider.api;
	return kubectlProviderApi;
}
