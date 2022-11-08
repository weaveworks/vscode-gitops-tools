import { window } from 'vscode';
import { AzureClusterProvider, azureTools, isAzureProvider } from '../azure/azureTools';
import { failed } from '../errorable';
import { fluxTools } from '../flux/fluxTools';
import { FluxSource, FluxWorkload } from '../flux/fluxTypes';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { HelmReleaseNode } from '../views/nodes/helmReleaseNode';
import { KustomizationNode } from '../views/nodes/kustomizationNode';
import { OCIRepositoryNode } from '../views/nodes/ociRepositoryNode';
import { getCurrentClusterInfo, refreshSourcesTreeView, refreshWorkloadsTreeView } from '../views/treeViews';

/**
 * Resume source or workload reconciliation and refresh its Tree View.
 *
 * @param node sources tree view node
 */
export async function resume(node: GitRepositoryNode | HelmReleaseNode | KustomizationNode) {

	const currentClusterInfo = await getCurrentClusterInfo();
	if (failed(currentClusterInfo)) {
		return;
	}

	const fluxResourceType: FluxSource | FluxWorkload | 'unknown' = node instanceof GitRepositoryNode ?
		'source git' : node instanceof OCIRepositoryNode ?
			'source oci' : node instanceof HelmReleaseNode ?
				'helmrelease' : node instanceof KustomizationNode ?
					'kustomization' : 'unknown';
	if (fluxResourceType === 'unknown') {
		window.showErrorMessage(`Unknown object kind ${fluxResourceType}`);
		return;
	}

	if (currentClusterInfo.result.isAzure) {
		// TODO: implement
		if (fluxResourceType === 'helmrelease' || fluxResourceType === 'kustomization') {
			window.showInformationMessage('Not implemented on AKS/ARC', { modal: true });
			return;
		}
		await azureTools.resume(node.resource.metadata.name || '', currentClusterInfo.result.contextName, currentClusterInfo.result.clusterProvider as AzureClusterProvider);
	} else {
		await fluxTools.resume(fluxResourceType, node.resource.metadata.name || '', node.resource.metadata.namespace || '');
	}

	if (node instanceof GitRepositoryNode || node instanceof OCIRepositoryNode) {
		refreshSourcesTreeView();
		if (currentClusterInfo.result.isAzure) {
			refreshWorkloadsTreeView();
		}
	} else {
		refreshWorkloadsTreeView();
	}
}
