import { window } from 'vscode';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
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
export async function fluxReconcileSourceCommand(source: GitRepositoryNode | HelmRepositoryNode | BucketNode): Promise<void> {

	const sourceType = source.resource.kind === KubernetesObjectKinds.GitRepository ? 'git' :
		source.resource.kind === KubernetesObjectKinds.HelmRepository ? 'helm' :
			source.resource.kind === KubernetesObjectKinds.Bucket ? 'bucket' : 'unknown';

	reconcileSource(sourceType, source.resource.metadata.name || '', source.resource.metadata.namespace || '');
}

/**
 * Run reconcile source command in the output view.
 * @param sourceType accepted source names in flux: `git`, `helm`, `bucket`.
 * @param sourceName name of the Source
 * @param sourceNamespace namespace of the Source
 */
export async function reconcileSource(sourceType: string, sourceName: string, sourceNamespace: string) {

	if (sourceType !== 'git' && sourceType !== 'helm' && sourceType !== 'bucket') {
		window.showErrorMessage(`Unknown resource kind ${sourceType}`);
		return;
	}

	await shell.execWithOutput(`flux reconcile source ${sourceType} ${sourceName} -n ${sourceNamespace}`);

	refreshSourceTreeView();
}
