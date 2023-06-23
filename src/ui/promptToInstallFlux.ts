import { window } from 'vscode';
import { installFluxCli } from 'commands/installFluxCli';
import { Errorable, failed } from 'types/errorable';
import { getFluxVersion } from 'cli/checkVersions';

/**
 * Show notification with button to install flux
 * (only when flux was not found).
 */

export async function promptToInstallFlux(): Promise<Errorable<null>> {
	const version = await getFluxVersion();
	if (failed(version)) {
		showInstallFluxNotification();
		return {
			succeeded: false,
			error: ['Flux not found'],
		};
	} else {
		return {
			succeeded: true,
			result: null,
		};
	}
}

async function showInstallFluxNotification() {
	const installButton = 'Install Flux';
	const pressedButton = await window.showErrorMessage('Please install flux CLI to use GitOps Tools.', installButton);
	if (pressedButton === installButton) {
		installFluxCli();
	}
}
