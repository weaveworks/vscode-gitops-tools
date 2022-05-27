import { SymbolKind, TextDocument, Uri, window, workspace } from 'vscode';
import { telemetry } from '../extension';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { TelemetryErrorEventNames } from '../telemetry';
import { NamespaceNode } from '../views/nodes/namespaceNode';

/**
 * Open document in the editor
 * @param uri target Uri to open
 */
export async function openDescribe(document: TextDocument) {
	window.showTextDocument(document);
}
