import { window } from 'vscode';

import { fluxTools } from 'cli/flux/fluxTools';
import { FluxWorkload } from 'types/fluxCliTypes';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { HelmReleaseNode } from 'ui/treeviews/nodes/workload/helmReleaseNode';
import { KustomizationNode } from 'ui/treeviews/nodes/workload/kustomizationNode';
import { refreshSourcesTreeView, refreshWorkloadsTreeView } from 'ui/treeviews/treeViews';

/**
 * Invoke flux reconcile of a specific workload.
 * @param workload Target workload tree view item.
 */
export async function fluxReconcileWorkload(workload: KustomizationNode | HelmReleaseNode, withSource = false): Promise<void> {
	/**
	 * Accepted workload names in flux: `kustomization`, `helmrelease`.
	 * Can be checked with: `flux reconcile --help`
	 */
	const workloadType: FluxWorkload | 'unknown' = workload.resource.kind === Kind.Kustomization ? 'kustomization' :
		workload.resource.kind === Kind.HelmRelease ? 'helmrelease' : 'unknown';
	if (workloadType === 'unknown') {
		window.showErrorMessage(`Unknown Workload resource kind ${workload.resource.kind}`);
		return;
	}

	await fluxTools.reconcile(workloadType, workload.resource.metadata?.name || '', workload.resource.metadata?.namespace || '', withSource);

	refreshWorkloadsTreeView();
	if(withSource) {
		refreshSourcesTreeView();
	}
}


export async function fluxReconcileWorkloadWithSource(workload: KustomizationNode | HelmReleaseNode): Promise<void> {
	fluxReconcileWorkload(workload, true);
}
