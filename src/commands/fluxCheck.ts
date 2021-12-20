import { shell } from '../shell';
import { ClusterContextNode } from '../views/nodes/clusterContextNode';

/**
 * Runs `flux check` command for selected cluster in the output view.
 * @param clusterNode target cluster node (from tree node context menu)
 */
export async function fluxCheck(clusterNode: ClusterContextNode) {
	shell.execWithOutput(`flux check --context ${clusterNode.contextName}`);
}
