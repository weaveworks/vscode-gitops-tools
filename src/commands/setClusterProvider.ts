import { window } from 'vscode';
import { globalState } from '../extension';
import { ClusterMetadata } from '../globalState';
import { KnownClusterProviders, knownClusterProviders } from '../kubernetes/types/kubernetesTypes';
import { ClusterContextNode } from '../views/nodes/clusterContextNode';
import { refreshAllTreeViews } from '../views/treeViews';

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
