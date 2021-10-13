import { window } from 'vscode';
import { KubernetesObjectKinds } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
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
	const applicationType = application.resource.kind === KubernetesObjectKinds.Kustomization ? 'kustomization' :
		application.resource.kind === KubernetesObjectKinds.HelmRelease ? 'helmrelease' : 'unknown';
	if (applicationType === 'unknown') {
		window.showErrorMessage(`Unknown application kind ${application.resource.kind}`);
		return;
	}

	await shell.execWithOutput(`flux reconcile ${applicationType} ${application.resource.metadata.name} -n ${application.resource.metadata.namespace}`);

	refreshApplicationTreeView();
}
