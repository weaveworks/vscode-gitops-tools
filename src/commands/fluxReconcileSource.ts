import { window } from 'vscode';

import { fluxTools } from 'cli/flux/fluxTools';
import { FluxSource } from 'types/fluxCliTypes';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { BucketNode } from 'ui/treeviews/nodes/source/bucketNode';
import { GitRepositoryNode } from 'ui/treeviews/nodes/source/gitRepositoryNode';
import { HelmRepositoryNode } from 'ui/treeviews/nodes/source/helmRepositoryNode';
import { OCIRepositoryNode } from 'ui/treeviews/nodes/source/ociRepositoryNode';
import { refreshSourcesTreeView } from 'ui/treeviews/treeViews';

/**
 * Invoke flux reconcile of a specific source.
 * @param source Target source tree view item.
 */
export async function fluxReconcileSourceCommand(source: GitRepositoryNode | OCIRepositoryNode | HelmRepositoryNode | BucketNode): Promise<void> {

	const sourceType: FluxSource | 'unknown' = source.resource.kind === Kind.GitRepository ? 'source git' :
		source.resource.kind === Kind.OCIRepository ? 'source oci' :
			source.resource.kind === Kind.HelmRepository ? 'source helm' :
				source.resource.kind === Kind.Bucket ? 'source bucket' : 'unknown';

	if (sourceType === 'unknown') {
		window.showErrorMessage(`Unknown Flux Source resource kind ${source.resource.kind}`);
		return;
	}

	await fluxTools.reconcile(sourceType, source.resource.metadata?.name || '', source.resource.metadata?.namespace || '');

	refreshSourcesTreeView();
}
