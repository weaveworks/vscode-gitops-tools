import { shell } from 'cli/shell/exec';
import { enabledFluxChecks } from 'extension';

/**
 * Runs `flux check --pre` command in the output view.
 */
export async function checkFluxPrerequisites() {
	if(enabledFluxChecks()) {
		// Missing debug message here
		// Ref: https://github.com/weaveworks/vscode-gitops-tools/pull/459
		// whenever we're skipping a call to `flux check` we should emit a skippable ...
		return await shell.execWithOutput('flux check --pre');
	} else {
		return true;
	}
}
