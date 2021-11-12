import { window } from 'vscode';
import { fluxTools } from '../flux/fluxTools';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { clusterTreeViewProvider, refreshSourceTreeView } from '../views/treeViews';

/**
 * Suspend source and refresh Sources Tree View
 *
 * @param node sources tree view node
 */
export async function suspendSource(node: GitRepositoryNode) {

	const currentCluster = clusterTreeViewProvider.getCurrentClusterNode();

	if (currentCluster?.clusterProvider === ClusterProvider.AKS ||
		currentCluster?.clusterProvider === ClusterProvider.AzureARC) {
		// TODO: suspend on AKS/ARC
		window.showInformationMessage('Suspend source is not yet implemented on AKS or Azure ARC', { modal: true });
	} else {
		if (node instanceof GitRepositoryNode) {
			await fluxTools.suspend('source git', node.resource.metadata.name || '');
		}
	}

	refreshSourceTreeView();
}
