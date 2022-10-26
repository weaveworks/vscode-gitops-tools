import { openConfigureGitOpsPanel } from '../panels/configureGitOps';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';

/**
 * Open ConfigureGitops webview with a source preselected (if user right-clicked a source node)
 * @param sourceNode user right-clicked this in the Sources treeview
 */
export async function addKustomization(sourceNode?: GitRepositoryNode) {
	const selectedSource = sourceNode?.resource?.metadata.name;

	openConfigureGitOpsPanel(true, selectedSource);
}
