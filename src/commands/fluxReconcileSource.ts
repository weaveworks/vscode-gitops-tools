import { window } from 'vscode';
import { KubernetesObjectKinds } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { BucketNode } from '../views/nodes/bucketNode';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { HelmRepositoryNode } from '../views/nodes/helmRepositoryNode';
import { refreshSourceTreeView } from '../views/treeViews';

/**
 * Invoke flux reconcile of a specific source.
 * @param source Target source tree view item.
 */
export async function fluxReconcileSource(source: GitRepositoryNode | HelmRepositoryNode | BucketNode): Promise<void> {
	/**
	 * Accepted source names in flux: `git`, `helm`, `bucket`.
	 * Can be checked with: `flux reconcile source --help`
	 */
	const sourceType = source.resource.kind === KubernetesObjectKinds.GitRepository ? 'git' :
		source.resource.kind === KubernetesObjectKinds.HelmRepository ? 'helm' :
			source.resource.kind === KubernetesObjectKinds.Bucket ? 'bucket' : 'unknown';
	if (sourceType === 'unknown') {
		window.showErrorMessage(`Unknown resource kind ${source.resource.kind}`);
		return;
	}

	await shell.execWithOutput(`flux reconcile source ${sourceType} ${source.resource.metadata.name} -n ${source.resource.metadata.namespace}`);

	refreshSourceTreeView();
}
