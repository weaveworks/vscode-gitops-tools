import { window } from 'vscode';
import { ClusterMetadata, globalState } from '../globalState';
import { KnownClusterProviders, knownClusterProviders } from '../kubernetes/kubernetesTypes';
import { ClusterNode } from '../views/nodes/clusterNode';
import { refreshAllTreeViews } from '../views/treeViews';

export async function setClusterProvider(clusterNode: ClusterNode) {

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
