import { Uri, window, workspace } from 'vscode';

import { telemetry } from 'extension';
import { TelemetryError } from 'types/telemetryEventNames';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { kubeConfigPath } from 'cli/kubernetes/kubernetesConfigWatcher';

/**
 * Open resource in the editor
 * @param uri target Uri to open
 */
export async function openResource(uri: Uri): Promise<void> {
	return await workspace.openTextDocument(uri).then(document => {
		if (document) {
			window.showTextDocument(document);
		}
	},
	error =>  {
		window.showErrorMessage(`Error loading document: ${error}`);
		telemetry.sendError(TelemetryError.FAILED_TO_OPEN_RESOURCE);
	});
}

export async function openKubeconfig() {
	if (kubeConfigPath) {
		openResource(Uri.file(kubeConfigPath));
	}
}
