import { window } from 'vscode';
import { fluxTools } from '../flux/fluxTools';
import { getAzureMetadata } from '../getAzureMetadata';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { getCurrentClusterNode, refreshSourceTreeView } from '../views/treeViews';

/**
 * Delete a source (currently only for git repository)
 *
 * @param sourceNode Sources tree view node
 */
export async function deleteSource(sourceNode: GitRepositoryNode /* | HelmRepositoryNode | BucketNode */) {

	const sourceName = sourceNode.resource.metadata.name || '';
	const sourceNamespace = sourceNode.resource.metadata.namespace || '';
	const confirmButton = 'Delete';
	const confirm = await window.showWarningMessage(`Do you want to delete Git Repository Source "${sourceName}"?`, {
		modal: true,
	}, confirmButton);
	if (!confirm) {
		return;
	}

	const currentClusterNode = getCurrentClusterNode();
	if (!currentClusterNode) {
		return;
	}

	const clusterProvider = await currentClusterNode.getClusterProvider();
	if (clusterProvider === ClusterProvider.Unknown) {
		return;
	}

	let deleteSourceQuery = '';

	if (clusterProvider === ClusterProvider.AKS ||
		clusterProvider === ClusterProvider.AzureARC) {
		const azureMetadata = await getAzureMetadata(currentClusterNode.name);
		if (!azureMetadata) {
			return;
		}

		deleteSourceQuery = `az k8s-configuration flux delete -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters'} --subscription ${azureMetadata.subscription} -n ${sourceName} --yes`;
		await shell.execWithOutput(deleteSourceQuery);
	} else {
		await fluxTools.deleteSource('source git', sourceName, sourceNamespace);
	}

	refreshSourceTreeView();
	checkIfOpenedFolderGitRepositorySourceExists();
}
