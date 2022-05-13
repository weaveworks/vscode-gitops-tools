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
		title || 'Documentation',
		ViewColumn.One, // Editor column to show the new webview panel in.
		{ // Enable scripts in the webview
			enableScripts: true, //Set this to true if you want to enable Javascript.
		},
	);

	panel.webview.html = await getWebviewContent(uri);
}

async function getWebviewContent(uri: Uri) {
	return await (await fetch(uri.toString())).text();
}
