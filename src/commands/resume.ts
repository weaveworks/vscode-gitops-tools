import { azureTools } from '../azure/azureTools';
import { fluxTools } from '../flux/fluxTools';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { getCurrentClusterNode, refreshSourcesTreeView } from '../views/treeViews';

/**
 * Resume source and refresh Sources Tree View
 *
 * @param node sources tree view node
 */
export async function resumeSource(node: GitRepositoryNode) {

	const currentClusterNode = getCurrentClusterNode();
	if (!currentClusterNode) {
		return;
	}

	const clusterProvider = await currentClusterNode.getClusterProvider();
	if (clusterProvider === ClusterProvider.Unknown) {
		return;
	}

	if (clusterProvider === ClusterProvider.AKS ||
		clusterProvider === ClusterProvider.AzureARC) {
		await azureTools.resume(currentClusterNode, clusterProvider, node.resource.metadata.name || '');
	} else {
		if (node instanceof GitRepositoryNode) {
			await fluxTools.resume('source git', node.resource.metadata.name || '', node.resource.metadata.namespace || '');
		}
	}

	refreshSourcesTreeView();
}
