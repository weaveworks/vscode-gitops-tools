import { window } from 'vscode';
import { fluxTools } from '../flux/fluxTools';
import { FluxSource } from '../flux/fluxTypes';
import { getAzureMetadata } from '../getAzureMetadata';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { ClusterProvider, KubernetesObjectKinds } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { HelmRepositoryNode } from '../views/nodes/helmRepositoryNode';
import { getCurrentClusterNode, refreshSourceTreeView } from '../views/treeViews';

/**
 * Delete a source (currently only for git repository)
 *
 * @param sourceNode Sources tree view node
 */
export async function deleteSource(sourceNode: GitRepositoryNode | HelmRepositoryNode /*| BucketNode */) {

	const sourceName = sourceNode.resource.metadata.name || '';
	const sourceNamespace = sourceNode.resource.metadata.namespace || '';
	const confirmButton = 'Delete';

	const sourceType: FluxSource = sourceNode.resource.kind === KubernetesObjectKinds.GitRepository ? 'source git' : 'source helm';

	const confirm = await window.showWarningMessage(`Do you want to delete ${sourceType} "${sourceName}"?`, {
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
		await fluxTools.deleteSource(sourceType, sourceName, sourceNamespace);
	}

	refreshSourceTreeView();
	checkIfOpenedFolderGitRepositorySourceExists();
}
