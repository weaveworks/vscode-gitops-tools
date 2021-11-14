import { window } from 'vscode';
import { fluxTools } from '../flux/fluxTools';
import { FluxApplication } from '../flux/fluxTypes';
import { KubernetesObjectKinds } from '../kubernetes/kubernetesTypes';
import { HelmReleaseNode } from '../views/nodes/helmReleaseNode';
import { KustomizationNode } from '../views/nodes/kustomizationNode';
import { refreshApplicationTreeView } from '../views/treeViews';

/**
 * Invoke flux reconcile of a specific application.
 * @param application Target application tree view item.
 */
export async function fluxReconcileApplication(application: KustomizationNode | HelmReleaseNode): Promise<void> {
	/**
	 * Accepted application names in flux: `kustomization`, `helmrelease`.
	 * Can be checked with: `flux reconcile --help`
	 */
	const applicationType: FluxApplication | 'unknown' = application.resource.kind === KubernetesObjectKinds.Kustomization ? 'kustomization' :
		application.resource.kind === KubernetesObjectKinds.HelmRelease ? 'helmrelease' : 'unknown';
	if (applicationType === 'unknown') {
		window.showErrorMessage(`Unknown Application resource kind ${application.resource.kind}`);
		return;
	}

	await fluxTools.reconcile(applicationType, application.resource.metadata.name || '', application.resource.metadata.namespace || '');

	refreshApplicationTreeView();
}
