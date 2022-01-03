import { commands, Uri, window } from 'vscode';
import { CommandId } from './commands';
import { extensionState } from './extensionState';
import { shell } from './shell';
import { parseJson } from './utils/jsonUtils';

export async function getKubectlVersion(): Promise<string | undefined> {
	const shellResult = await shell.exec('kubectl version --short');

	if (shellResult?.code === 0) {
		return shellResult.stdout;
	}
}

interface AzureVersion {
	'azure-cli': string;
	'azure-cli-core': string;
	'azure-cli-telemetry': string;
	'extensions': {
		// there might be other extensions but they are not important
		'k8s-configuration': string;
		'k8s-extension': string;
	};
}
export async function getAzureVersion(): Promise<AzureVersion | undefined> {
	const shellResult = await shell.exec('az version');

	if (shellResult?.code === 0) {
		return parseJson(shellResult.stdout);
	}
}

/**
 * Return flux version string.
 * @see https://fluxcd.io/docs/cmd/flux_version/
 */
export async function getFluxVersion(): Promise<string | undefined> {
	const shellResult = await shell.exec('flux --version');

	if (shellResult?.code === 0) {
		const fluxVersion = shellResult.stdout.slice(13).trim();
		extensionState.set('fluxVersion', fluxVersion);
		return fluxVersion;
	}
}

/**
 * Show notification with button to install flux
 * (only when flux was not found).
 */
export async function promptToInstallFlux(): Promise<void> {
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
 * @see https://fluxcd.io/docs/cmd/flux_check/
 */
export async function checkPrerequisites() {
	const prerequisiteShellResult = await shell.execWithOutput('flux check --pre', { revealOutputView: false });

	if (prerequisiteShellResult?.code !== 0) {
		const showOutput = 'Show Output';
		const showOutputConfirm = await window.showWarningMessage('Flux prerequisites check failed.', showOutput);
		if (showOutput === showOutputConfirm) {
			commands.executeCommand(CommandId.ShowOutputChannel);
		}
	}
}

/**
 * Return git version or undefined depending
 * on whether or not git was found on the user machine.
 */
export async function getGitVersion(): Promise<string | undefined> {
	const gitVersionShellResult = await shell.execWithOutput('git --version', { revealOutputView: false });

	if (gitVersionShellResult?.code === 0) {
		return gitVersionShellResult.stdout.slice('git version '.length);
	}
}

/**
 * Check if git is found and prompt to install it (if needed).
 */
export async function checkGitVersion(): Promise<string | undefined> {
	const gitVersion: string | undefined = await getGitVersion();

	if (gitVersion === undefined) {
		const installButton = 'Install';
		const confirm = await window.showErrorMessage('Please install Git.', installButton);
		if (confirm === installButton) {
			commands.executeCommand('vscode.open', Uri.parse('https://git-scm.com/downloads'));
		}
	} else {
		return gitVersion;
	}
}
