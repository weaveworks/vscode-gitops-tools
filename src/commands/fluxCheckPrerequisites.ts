import { shell } from 'cli/shell/exec';
import { enabledFluxChecks } from 'extension';

/**
 * Runs `flux check --pre` command in the output view.
 */
export async function checkFluxPrerequisites() {
	if(enabledFluxChecks()) {
		return await shell.execWithOutput('flux check --pre');
	} else {
		return true;
	}
}
