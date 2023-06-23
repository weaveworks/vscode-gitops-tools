import { window } from 'vscode';
import { fluxTools } from '../cli/flux/fluxTools';
import { FluxSource } from '../types/fluxCliTypes';
import { KubernetesObjectKinds } from '../types/kubernetes/kubernetesTypes';
import { BucketNode } from '../treeviews/nodes/bucketNode';
import { GitRepositoryNode } from '../treeviews/nodes/gitRepositoryNode';
import { OCIRepositoryNode } from '../treeviews/nodes/ociRepositoryNode';
import { HelmRepositoryNode } from '../treeviews/nodes/helmRepositoryNode';
import { refreshSourcesTreeView } from '../treeviews/treeViews';

/**
 * Invoke flux reconcile of a specific source.
 * @param source Target source tree view item.
 */
export async function fluxReconcileSourceCommand(source: GitRepositoryNode | OCIRepositoryNode | HelmRepositoryNode | BucketNode): Promise<void> {

	const sourceType: FluxSource | 'unknown' = source.resource.kind === KubernetesObjectKinds.GitRepository ? 'source git' :
		source.resource.kind === KubernetesObjectKinds.OCIRepository ? 'source oci' :
			source.resource.kind === KubernetesObjectKinds.HelmRepository ? 'source helm' :
				source.resource.kind === KubernetesObjectKinds.Bucket ? 'source bucket' : 'unknown';

	if (sourceType === 'unknown') {
		window.showErrorMessage(`Unknown Flux Source resource kind ${source.resource.kind}`);
		return;
	}

	await fluxTools.reconcile(sourceType, source.resource.metadata.name || '', source.resource.metadata.namespace || '');

	refreshSourcesTreeView();
}
