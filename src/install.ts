import { commands, Uri, window } from 'vscode';
import { OutputCommands } from './commands';
import { shell } from './shell';
import { parseJson } from './utils/jsonUtils';

interface KubectlVersion {
	major: string;
	minor: string;
	gitVersion: string;
	gitCommit: string;
	gitTreeState: string;
	buildDate: string;
	goVersion: string;
	compiler: string;
	platform: string;
}

interface KubectlVersionResult {
	clientVersion: KubectlVersion;
	serverVersion: KubectlVersion;
}

/**
 * Return kubectl version (cluent + server) in
 * json format.
 */
export async function getKubectlVersion(): Promise<KubectlVersionResult | undefined> {
	const shellResult = await shell.exec('kubectl version -o json');
	if (!shellResult) {
		return;
	}
	if (shellResult.code === 0) {
		return parseJson(shellResult.stdout);
	}
}

/**
 * Return flux version string.
 */
export async function getFluxVersion() {
	const shellResult = await shell.execWithOutput('flux --version', false);
	if (!shellResult) {
		return;
	}
	if (shellResult.code === 0) {
		return shellResult.stdout;
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
