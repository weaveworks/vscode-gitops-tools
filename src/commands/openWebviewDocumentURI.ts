import { Uri, window, ViewColumn, env } from 'vscode';
import { failed } from '../errorable';
import { telemetry } from '../extension';
import fetch from 'node-fetch';

/**
 * Open the webview with some documentation from a URL.
 */
export async function openWebviewDocumentURI(uri: Uri, title?: string) {
	// Based on example from:
	// https://betterprogramming.pub/how-to-add-webviews-to-a-visual-studio-code-extension-69884706f056

	const panel = window.createWebviewPanel(
		'gitopsWebview', // Identifies the type of the webview. Used internally
		title || 'Documentation', // Fallback to this string if no title provided
		ViewColumn.One, // Editor column to show the new webview panel in.
		{
			enableScripts: false, // (Note: scripts did not seem to be working when enabled)
		},
	);

	panel.webview.html = await getWebviewContent(uri);
}

async function getWebviewContent(uri: Uri) {
	return await (await fetch(uri.toString())).text();
}
