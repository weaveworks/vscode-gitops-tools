import { SymbolKind, Uri, window, workspace } from 'vscode';
import { telemetry } from '../extension';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { TelemetryErrorEventNames } from '../telemetry';
import { NamespaceNode } from '../views/nodes/namespaceNode';

/**
 * Open resource in the editor
 * @param uri target Uri to open
 */
export async function openDescribe(kind: string, namespace: string, name: string): Promise<void> {
	return await kubernetesTools.describeResource(name, namespace, kind).then(document => {
		if (document) {
			window.showTextDocument(document);
		}
	},
	error =>  {
		window.showErrorMessage(`Error loading document: ${error}`);
		telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_OPEN_RESOURCE);
	});
}
