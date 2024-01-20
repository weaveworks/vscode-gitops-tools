import { window } from 'vscode';
import { AzureClusterProvider, azureTools, isAzureProvider } from '../azure/azureTools';
import { failed } from '../errorable';
import { fluxTools } from '../flux/fluxTools';
import { FluxSource, FluxWorkload } from '../flux/fluxTypes';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { HelmReleaseNode } from '../views/nodes/helmReleaseNode';
import { HelmRepositoryNode } from '../views/nodes/helmRepositoryNode';
import { KustomizationNode } from '../views/nodes/kustomizationNode';
import { OCIRepositoryNode } from '../views/nodes/ociRepositoryNode';
import { getCurrentClusterInfo, refreshSourcesTreeView, refreshWorkloadsTreeView } from '../views/treeViews';

/**
 * Suspend source or workload reconciliation and refresh its Tree View.
 *
 * @param node sources tree view node
 */
export async function suspend(node: GitRepositoryNode | HelmReleaseNode | KustomizationNode | HelmRepositoryNode) {

	const currentClusterInfo = await getCurrentClusterInfo();
	if (failed(currentClusterInfo)) {
		return;
	}

	const fluxResourceType: FluxSource | FluxWorkload | 'unknown' = node instanceof GitRepositoryNode ?
		'source git' : node instanceof HelmRepositoryNode ?
			'source helm' : node instanceof OCIRepositoryNode ?
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

		await azureTools.suspend(node.resource.metadata.name || '', currentClusterInfo.result.contextName, currentClusterInfo.result.clusterProvider as AzureClusterProvider);
	} else {
		await fluxTools.suspend(fluxResourceType, node.resource.metadata.name || '', node.resource.metadata.namespace || '');
	}

	if (node instanceof GitRepositoryNode || node instanceof OCIRepositoryNode || node instanceof HelmRepositoryNode) {
		refreshSourcesTreeView();
		if (currentClusterInfo.result.isAzure) {
			refreshWorkloadsTreeView();
		}
	} else {
		refreshWorkloadsTreeView();
	}
}
