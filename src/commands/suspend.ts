import { window } from 'vscode';
import { fluxTools } from '../flux/fluxTools';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { getCurrentClusterNode, refreshSourceTreeView } from '../views/treeViews';

/**
 * Suspend source and refresh Sources Tree View
 *
 * @param node sources tree view node
 */
export async function suspendSource(node: GitRepositoryNode) {

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
		// TODO: suspend on AKS/ARC
		window.showInformationMessage('Suspend source is not yet implemented on AKS or Azure ARC', { modal: true });
	} else {
		if (node instanceof GitRepositoryNode) {
			await fluxTools.suspend('source git', node.resource.metadata.name || '', node.resource.metadata.namespace || '');
		}
	}

	refreshSourceTreeView();
}
