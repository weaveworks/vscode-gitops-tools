import { commands, Uri, window } from 'vscode';

import * as shell from 'cli/shell/exec';
import { enabledWGE, telemetry, enabledFluxChecks, suppressDebugMessages } from 'extension';
import { Errorable, failed } from 'types/errorable';
import { CommandId } from 'types/extensionIds';
import { TelemetryError } from 'types/telemetryEventNames';
import { clusterDataProvider } from 'ui/treeviews/treeViews';
import { parseJson } from 'utils/jsonUtils';
import { shellCodeError } from './shell/exec';

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

/** Result of running `kubectl version -o json` */
export interface KubectlVersionResult {
	clientVersion: KubectlVersion;
	serverVersion: KubectlVersion;
}

export let fluxVersion: string;

export async function getKubectlVersion(): Promise<Errorable<KubectlVersionResult>> {
	const kubectlVersionShellResult = await shell.exec('kubectl version --short -o json');

	if (kubectlVersionShellResult.code === 0) {
		const version: KubectlVersionResult = parseJson(kubectlVersionShellResult.stdout);
		return {
			succeeded: true,
			result: version,
		};
	} else {
		return {
			succeeded: false,
			error: [shellCodeError(kubectlVersionShellResult)],
		};
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

export async function getAzureVersion(): Promise<Errorable<AzureVersion>> {
	const azureVersionShellResult = await shell.exec('az version');

	if (azureVersionShellResult.code === 0) {
		return {
			succeeded: true,
			result: parseJson(azureVersionShellResult.stdout),
		};
	} else {
		return {
			succeeded: false,
			error: [shellCodeError(azureVersionShellResult)],
		};
	}
}


/**
 * Return flux version string.
 * @see https://fluxcd.io/docs/cmd/flux_version/
 */
export async function getFluxVersion(): Promise<Errorable<string>> {
	const fluxVersionShellResult = await shell.exec('flux version --client -o json');

	if (fluxVersionShellResult.code === 0) {
		fluxVersion = parseJson(fluxVersionShellResult.stdout.trim()).flux;
		clusterDataProvider.refreshCurrentNode();

		return {
			succeeded: true,
			result: fluxVersion,
		};
	} else {

		fluxVersion = 'unavailable';
		return {
			succeeded: false,
			error: [shellCodeError(fluxVersionShellResult)],
		};
	}
}

/**
 * Show warning notification only in case the
 * flux prerequisite check has failed.
 * @see https://fluxcd.io/docs/cmd/flux_check/
 */
export async function checkFluxPrerequisites() {
	if(enabledFluxChecks()) {
		const prerequisiteShellResult = await shell.execWithOutput('flux check --pre', { revealOutputView: false });
		if (prerequisiteShellResult.code !== 0) {
			const showOutput = 'Show Output';
			const showOutputConfirm = await window.showWarningMessage('Flux prerequisites check failed.', showOutput);
			if (showOutput === showOutputConfirm) {
				commands.executeCommand(CommandId.ShowOutputChannel);
			}
		}
	} else {
		if(!suppressDebugMessages()) {
			window.showInformationMessage('DEBUG: not running `flux check`');
		}
	}
}

/**
 * Return git version or undefined depending
 * on whether or not git was found on the user machine.
 */
export async function getGitVersion(): Promise<Errorable<string>> {
	const gitVersionShellResult = await shell.exec('git --version');

	if (gitVersionShellResult.code === 0) {
		const gitVersion = gitVersionShellResult.stdout.slice('git version '.length).trim();
		return {
			succeeded: true,
			result: gitVersion,
		};
	} else {
		return {
			succeeded: false,
			error: [shellCodeError(gitVersionShellResult)],
		};
	}
}

/**
 * Check if git is found and prompt to install it (if needed).
 */
export async function checkGitVersion(): Promise<string | undefined> {
	const gitVersionShellResult = await getGitVersion();

	if (failed(gitVersionShellResult)) {
		telemetry.sendError(TelemetryError.GIT_NOT_INSTALLED);
		const installButton = 'Install';
		const confirm = await window.showErrorMessage('Please install Git.', installButton);
		if (confirm === installButton) {
			commands.executeCommand('vscode.open', Uri.parse('https://git-scm.com/downloads'));
		}
	} else {
		return gitVersionShellResult.result;
	}
}


export async function checkWGEVersion() {
	if(!enabledWGE()) {
		return;
	}

	const result = await shell.exec('gitops version');
	if(!result.stdout.includes('Enterprise-Edition')) {
		const confirm = await window.showWarningMessage('Please install WGE `gitops` CLI to use WGE features', 'Install', 'Skip');
		if (confirm === 'Install') {
			commands.executeCommand('vscode.open', Uri.parse('https://docs.gitops.weave.works/docs/next/gitops-templates/cli/#installation'));
		}
	}
}
