import { Uri, window, workspace } from 'vscode';
import { SpecificErrorEvent, telemetry } from '../telemetry';

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
		telemetry.sendError(SpecificErrorEvent.FAILED_TO_OPEN_RESOURCE);
	});
}
