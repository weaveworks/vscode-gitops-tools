import { window } from 'vscode';
import { getAzureMetadata } from '../getAzureMetadata';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { clusterTreeViewProvider, refreshSourceTreeView } from '../views/treeViews';

export async function deleteSource(sourceNode: GitRepositoryNode /* | HelmRepositoryNode | BucketNode */) {

	const sourceName = sourceNode.resource.metadata.name;
	const confirmButton = 'Delete';
	const confirm = await window.showWarningMessage(`Do you want to delete Git Repository Source "${sourceName}"?`, {
		modal: true,
	}, confirmButton);
	if (!confirm) {
		return;
	}

	const currentClusterNode = clusterTreeViewProvider.getCurrentClusterNode();

	let deleteSourceQuery = '';

	if (currentClusterNode?.clusterProvider === ClusterProvider.AKS ||
		currentClusterNode?.clusterProvider === ClusterProvider.AzureARC) {
		const azureMetadata = await getAzureMetadata(currentClusterNode.name);
		if (!azureMetadata) {
			return;
		}

		deleteSourceQuery = `az k8s-configuration flux delete -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${currentClusterNode.clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters'} --subscription ${azureMetadata.subscription} -n ${sourceName} --yes`;
	} else {
		deleteSourceQuery = `flux delete source git ${sourceName} --silent`;
	}

	await shell.execWithOutput(deleteSourceQuery);
	refreshSourceTreeView();
}
