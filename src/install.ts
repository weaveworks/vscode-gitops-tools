import { commands, Uri, window } from 'vscode';
import { OutputCommands } from './commands';
import { extensionState } from './extensionState';
import { shell } from './shell';

/**
 * Return flux version string.
 */
export async function getFluxVersion() {
	const shellResult = await shell.execWithOutput('flux --version', false);
	if (!shellResult) {
		return;
	}
	if (shellResult.code === 0) {
		const fluxVersion = shellResult.stdout.slice(13).trim();
		extensionState.set('fluxVersion', fluxVersion);
		return fluxVersion;
	}
}

/**
 * Show notification with button to install flux
 * (only when flux was not found).
 */
export async function promptToInstallFlux() {
	const fluxVersion = await getFluxVersion();

	if (!fluxVersion) {
		const installButton = 'Install Flux';
		const confirm = await window.showErrorMessage('Please install flux CLI to use GitOps Tools.', installButton);
		if (confirm === installButton) {
			commands.executeCommand('vscode.open', Uri.parse('https://fluxcd.io/docs/installation/'));
		}
	}
}

/**
 * Show warning notification only in case the
 * flux prerequisite check has failed.
 */
export async function checkPrerequisites() {
	const prerequisiteShellResult = await shell.execWithOutput('flux check --pre', false);

	if (prerequisiteShellResult?.code !== 0) {
		const showOutput = 'Show Output';
		const showOutputConfirm = await window.showWarningMessage('Flux prerequisites check failed.', showOutput);
		if (showOutput === showOutputConfirm) {
			commands.executeCommand(OutputCommands.ShowOutputChannel);
		}
	}
}
