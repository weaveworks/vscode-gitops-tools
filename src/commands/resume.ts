import { window } from 'vscode';

import { AzureClusterProvider, azureTools } from 'cli/azure/azureTools';
import { fluxTools } from 'cli/flux/fluxTools';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { failed } from 'types/errorable';
import { FluxSource, FluxWorkload } from 'types/fluxCliTypes';
import { GitRepositoryNode } from 'ui/treeviews/nodes/source/gitRepositoryNode';
import { HelmRepositoryNode } from 'ui/treeviews/nodes/source/helmRepositoryNode';
import { OCIRepositoryNode } from 'ui/treeviews/nodes/source/ociRepositoryNode';
import { HelmReleaseNode } from 'ui/treeviews/nodes/workload/helmReleaseNode';
import { KustomizationNode } from 'ui/treeviews/nodes/workload/kustomizationNode';
import { getCurrentClusterInfo, refreshSourcesTreeView, refreshWorkloadsTreeView } from 'ui/treeviews/treeViews';

/**
 * Resume source or workload reconciliation and refresh its Tree View.
 *
 * @param node sources tree view node
 */
export async function resume(node: GitRepositoryNode | HelmReleaseNode | HelmRepositoryNode | KustomizationNode) {
	const contextName = kubeConfig.getCurrentContext();
	const currentClusterInfo = await getCurrentClusterInfo();
	if (failed(currentClusterInfo) || !contextName) {
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
		await azureTools.resume(node.resource.metadata?.name || '', contextName, currentClusterInfo.result.clusterProvider as AzureClusterProvider);
	} else {
		await fluxTools.resume(fluxResourceType, node.resource.metadata?.name || '', node.resource.metadata?.namespace || '');
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
