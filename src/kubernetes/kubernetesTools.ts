import { window } from 'vscode';
import { ClusterProviderV1, extension } from 'vscode-kubernetes-tools-api';

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
