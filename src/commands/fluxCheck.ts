import safesh from 'shell-escape-tag';

import { shell } from 'cli/shell/exec';
import { ClusterNode } from 'ui/treeviews/nodes/cluster/clusterNode';

/**
 * Runs `flux check` command for selected cluster in the output view.
 * @param clusterNode target cluster node (from tree node context menu)
 */
export async function fluxCheck(clusterNode: ClusterNode) {
	shell.execWithOutput(safesh`flux check --context ${clusterNode.context.name}`);
}
