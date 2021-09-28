import {
    commands,
    Uri,
    window
} from 'vscode';
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
	const shellResult = await shell.exec('flux --version');
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
		const installButton = 'Installation page';
		const confirm = await window.showErrorMessage('flux is not installed. It is required for GitOps extension.', installButton);
		if (confirm === installButton) {
			commands.executeCommand('vscode.open', Uri.parse('https://fluxcd.io/docs/installation/'));
		}
	}
}
