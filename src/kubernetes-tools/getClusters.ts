import { window } from 'vscode';
import * as k8s from 'vscode-kubernetes-tools-api';

let clusterProviderApi: k8s.ClusterProviderV1;

export async function getClusterProvider() {
  if (clusterProviderApi) {
    return clusterProviderApi;
  }
  const clusterProvider = await k8s.extension.clusterProvider.v1;
  if (!clusterProvider.available) {
    window.showErrorMessage(`Cluster provider API is unavailable ${clusterProvider.reason}`);
    return;
  }
  clusterProviderApi = clusterProvider.api;
  return clusterProviderApi;
}
