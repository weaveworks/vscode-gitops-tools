import { window } from 'vscode';
import { azureTools, isAzureProvider } from '../azure/azureTools';
import { fluxTools } from '../flux/fluxTools';
import { FluxSource, FluxWorkload } from '../flux/fluxTypes';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { HelmReleaseNode } from '../views/nodes/helmReleaseNode';
import { KustomizationNode } from '../views/nodes/kustomizationNode';
import { getCurrentClusterNode, refreshSourcesTreeView, refreshWorkloadsTreeView } from '../views/treeViews';

/**
 * Suspend source or workload reconciliation and refresh its Tree View.
 *
 * @param node sources tree view node
 */
export async function suspend(node: GitRepositoryNode | HelmReleaseNode | KustomizationNode) {

	const currentClusterNode = getCurrentClusterNode();
	if (!currentClusterNode) {
		return;
	}

	const clusterProvider = await currentClusterNode.getClusterProvider();
	if (clusterProvider === ClusterProvider.Unknown) {
		return;
	}

	const fluxResourceType: FluxSource | FluxWorkload | 'unknown' = node instanceof GitRepositoryNode ?
		'source git' : node instanceof HelmReleaseNode ?
			'helmrelease' : node instanceof KustomizationNode ?
				'kustomization' : 'unknown';

	if (fluxResourceType === 'unknown') {
		window.showErrorMessage(`Unknown object kind ${fluxResourceType}`);
		return;
	}

	if (isAzureProvider(clusterProvider)) {
		// TODO: implement
		if (fluxResourceType === 'helmrelease' || fluxResourceType === 'kustomization') {
			window.showInformationMessage('Not implemented on AKS/ARC', { modal: true });
			return;
		}

		await azureTools.suspend(node.resource.metadata.name || '', currentClusterNode, clusterProvider);
	} else {
		await fluxTools.suspend(fluxResourceType, node.resource.metadata.name || '', node.resource.metadata.namespace || '');
	}

	if (node instanceof GitRepositoryNode) {
		refreshSourcesTreeView();
	} else {
		refreshWorkloadsTreeView();
	}
}
