import safesh from 'shell-escape-tag';
import { shell } from '../shell/shell';
import { ClusterContextNode } from '../ui/treeviews/nodes/clusterContextNode';

/**
 * Runs `flux check` command for selected cluster in the output view.
 * @param clusterNode target cluster node (from tree node context menu)
 */
export async function fluxCheck(clusterNode: ClusterContextNode) {
	shell.execWithOutput(safesh`flux check --context ${clusterNode.contextName}`);
}
