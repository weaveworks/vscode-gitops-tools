import { window } from 'vscode';
import { azureTools, isAzureProvider } from '../azure/azureTools';
import { fluxTools } from '../flux/fluxTools';
import { FluxSource, FluxWorkload } from '../flux/fluxTypes';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { HelmReleaseNode } from '../views/nodes/helmReleaseNode';
import { KustomizationNode } from '../views/nodes/kustomizationNode';
import { getCurrentClusterInfo, refreshSourcesTreeView, refreshWorkloadsTreeView } from '../views/treeViews';

/**
 * Resume source or workload reconciliation and refresh its Tree View.
 *
 * @param node sources tree view node
 */
export async function resume(node: GitRepositoryNode | HelmReleaseNode | KustomizationNode) {

	const currentClusterInfo = await getCurrentClusterInfo();
	if (!currentClusterInfo) {
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

	if (isAzureProvider(currentClusterInfo.clusterProvider)) {
		// TODO: implement
		if (fluxResourceType === 'helmrelease' || fluxResourceType === 'kustomization') {
			window.showInformationMessage('Not implemented on AKS/ARC', { modal: true });
			return;
		}
		await azureTools.resume(node.resource.metadata.name || '', currentClusterInfo.clusterNode, currentClusterInfo.clusterProvider);
	} else {
		await fluxTools.resume(fluxResourceType, node.resource.metadata.name || '', node.resource.metadata.namespace || '');
	}

	if (node instanceof GitRepositoryNode) {
		refreshSourcesTreeView();
		if (isAzureProvider(currentClusterInfo.clusterProvider)) {
			refreshWorkloadsTreeView();
		}
	} else {
		refreshWorkloadsTreeView();
	}
}
