import { shell } from '../shell';
import { ClusterNode } from '../views/nodes/clusterNode';

/**
 * Runs `flux check` command for selected cluster in the output view.
 * @param clusterNode target cluster node (from tree node context menu)
 */
export async function fluxCheck(clusterNode: ClusterNode) {
	shell.execWithOutput(`flux check --context ${clusterNode.name}`);
}
