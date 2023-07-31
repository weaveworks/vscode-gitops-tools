import safesh from 'shell-escape-tag';

import { shell } from 'cli/shell/exec';
import { ClusterNode } from 'ui/treeviews/nodes/cluster/clusterNode';
import { enabledFluxChecks } from 'extension';
import { window } from 'vscode';

/**
 * Runs `flux check` command for selected cluster in the output view.
 * @param clusterNode target cluster node (from tree node context menu)
 */
export async function fluxCheck(clusterNode: ClusterNode) {
	if(enabledFluxChecks()) {
		shell.execWithOutput(safesh`flux check --context ${clusterNode.context.name}`);
	} else {
		// user called for health checking, notify them it isn't being performed
		window.showInformationMessage('DEBUG: not running `flux check`');
	}
}
