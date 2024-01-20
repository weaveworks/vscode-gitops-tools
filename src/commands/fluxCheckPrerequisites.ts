import { shell } from '../shell';

/**
 * Runs `flux check --pre` command in the output view.
 */
export async function checkFluxPrerequisites() {
	return await shell.execWithOutput('flux check --pre');
}
