import safesh from 'shell-escape-tag';

import * as shell from 'cli/shell/exec';
import { ClusterNode } from 'ui/treeviews/nodes/cluster/clusterNode';
import { enabledFluxChecks, suppressDebugMessages } from 'extension';
import { window } from 'vscode';

/**
 * Runs `flux check` command for selected cluster in the output view.
 * @param clusterNode target cluster node (from tree node context menu)
 */
export async function fluxCheck(clusterNode: ClusterNode) {
	shell.execWithOutput(safesh`flux check --context ${clusterNode.context.name}`);
}
