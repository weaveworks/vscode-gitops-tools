import { window } from 'vscode';
import { globalState } from 'extension';
import { ClusterMetadata } from 'data/globalState';
import { KnownClusterProviders, knownClusterProviders } from 'types/kubernetes/kubernetesTypes';
import { ClusterContextNode } from 'ui/treeviews/nodes/clusterContextNode';
import { refreshAllTreeViews } from 'ui/treeviews/treeViews';

export async function setClusterProvider(clusterNode: ClusterContextNode) {

	const automatically = 'Automatically (Let the extension infer)';
	const quickPickItems: string[] = [...knownClusterProviders, automatically];

	const pickedProvider = await window.showQuickPick(quickPickItems, {
		title: `Choose cluster provider for "${clusterNode.clusterName}" cluster.`,
	});
	if (!pickedProvider) {
		return;
	}

	const clusterMetadata: ClusterMetadata = globalState.getClusterMetadata(clusterNode.clusterName) || {};
	const oldClusterProvider = clusterMetadata.clusterProvider;

	if (pickedProvider === automatically) {
		clusterMetadata.clusterProvider = undefined;
	} else {
		clusterMetadata.clusterProvider = pickedProvider as KnownClusterProviders;
	}

	globalState.setClusterMetadata(clusterNode.clusterName, clusterMetadata);

	if (clusterMetadata.clusterProvider !== oldClusterProvider) {
		refreshAllTreeViews();
	}
}
