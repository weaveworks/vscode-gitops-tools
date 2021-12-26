import { Uri, WebviewOptions, WebviewPanelOptions } from 'vscode';

type WebviewOptionsType = WebviewOptions & WebviewPanelOptions;

export function getWebviewOptions(extensionUri: Uri): WebviewOptionsType {
	const webviewOptions: WebviewOptionsType = {
		// Enable javascript in the webview
		enableScripts: true,
		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [Uri.joinPath(extensionUri, 'media')],
		// Keep the webview state after active editor switch (not for vscode reloads)
		// retainContextWhenHidden: true,
	};
	return webviewOptions;
}

export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
