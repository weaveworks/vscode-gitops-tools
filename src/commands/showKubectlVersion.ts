import { shell, ShellResult } from '../shell';

/**
 * Outputs kubectl version in the output view.
 */
export async function showKubectlVersion(): Promise<ShellResult> {
	return await shell.execWithOutput('kubectl version');
}
