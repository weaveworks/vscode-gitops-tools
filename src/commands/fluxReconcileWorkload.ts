import { window } from 'vscode';
import { fluxTools } from '../cli/flux/fluxTools';
import { FluxWorkload } from '../types/fluxCliTypes';
import { KubernetesObjectKinds } from '../types/kubernetes/kubernetesTypes';
import { HelmReleaseNode } from '../ui/treeviews/nodes/helmReleaseNode';
import { KustomizationNode } from '../ui/treeviews/nodes/kustomizationNode';
import { refreshWorkloadsTreeView } from '../ui/treeviews/treeViews';

/**
 * Invoke flux reconcile of a specific workload.
 * @param workload Target workload tree view item.
 */
export async function fluxReconcileWorkload(workload: KustomizationNode | HelmReleaseNode): Promise<void> {
	/**
	 * Accepted workload names in flux: `kustomization`, `helmrelease`.
	 * Can be checked with: `flux reconcile --help`
	 */
	const workloadType: FluxWorkload | 'unknown' = workload.resource.kind === KubernetesObjectKinds.Kustomization ? 'kustomization' :
		workload.resource.kind === KubernetesObjectKinds.HelmRelease ? 'helmrelease' : 'unknown';
	if (workloadType === 'unknown') {
		window.showErrorMessage(`Unknown Workload resource kind ${workload.resource.kind}`);
		return;
	}

	await fluxTools.reconcile(workloadType, workload.resource.metadata.name || '', workload.resource.metadata.namespace || '');

	refreshWorkloadsTreeView();
}
