import { window } from 'vscode';
import { azureTools, isAzureProvider } from '../azure/azureTools';
import { fluxTools } from '../flux/fluxTools';
import { FluxSource } from '../flux/fluxTypes';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { ClusterProvider, KubernetesObjectKinds } from '../kubernetes/kubernetesTypes';
import { BucketNode } from '../views/nodes/bucketNode';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { HelmRepositoryNode } from '../views/nodes/helmRepositoryNode';
import { getCurrentClusterNode, refreshSourcesTreeView } from '../views/treeViews';

/**
 * Delete a source
 *
 * @param sourceNode Sources tree view node
 */
export async function deleteSource(sourceNode: GitRepositoryNode | HelmRepositoryNode | BucketNode) {

	const sourceName = sourceNode.resource.metadata.name || '';
	const sourceNamespace = sourceNode.resource.metadata.namespace || '';
	const confirmButton = 'Delete';

	const sourceType: FluxSource | 'unknown' = sourceNode.resource.kind === KubernetesObjectKinds.GitRepository ? 'source git' :
		sourceNode.resource.kind === KubernetesObjectKinds.HelmRepository ? 'source helm' :
			sourceNode.resource.kind === KubernetesObjectKinds.Bucket ? 'source bucket' : 'unknown';

	if (sourceType === 'unknown') {
		window.showErrorMessage(`Unknown Source resource kind ${sourceNode.resource.kind}`);
		return;
	}

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

	if (isAzureProvider(clusterProvider)) {
		await azureTools.deleteSource(sourceName, currentClusterNode, clusterProvider);
	} else {
		await fluxTools.deleteSource(sourceType, sourceName, sourceNamespace);
	}

	refreshSourcesTreeView();

	if (sourceType === 'source git') {
		checkIfOpenedFolderGitRepositorySourceExists();
	}
}
