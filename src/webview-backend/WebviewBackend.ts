import { Disposable, Uri, ViewColumn, Webview, WebviewPanel, window } from 'vscode';
import { camelCase } from 'change-case';

import { asAbsolutePath } from '../extensionContext';
import { getUri } from '../utils/getUri';
import { WebviewParams } from './types';

export type MessageReceiver = (message: any, panel: WebviewPanel)=> any;

export class WebviewBackend {
	public panel: WebviewPanel;
	private disposables: Disposable[] = [];
	private webviewParams: WebviewParams;
	private extensionUri: Uri;
	private messageReceiver: MessageReceiver;
	private title: string;
	public disposed = false;

	constructor(title: string, extensionUri: Uri, params: WebviewParams, messageReceiver: MessageReceiver) {
		this.title = title;
		this.webviewParams = params;
		this.extensionUri = extensionUri;
		this.messageReceiver = messageReceiver;
		this.panel = this.create();

		this.listenDidReceiveMessage();
	}

	update(params: WebviewParams) {
		this.webviewParams = params;
		this.panel.webview.postMessage({
			type: 'set-params',
			params: this.webviewParams,
		});
		this.panel.reveal(ViewColumn.One);
	}

	dispose() {
		this.panel.dispose();

		// Dispose of all disposables (i.e. commands) for the current webview panel
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
		this.disposed = true;
	}

	private create(): WebviewPanel {
		const panel = window.createWebviewPanel(
			camelCase(this.title),
			this.title,
			// The editor column the panel should be displayed in
			ViewColumn.One,
			// Extra panel configurations
			{
				enableScripts: true,
				retainContextWhenHidden: true,
			}) as WebviewPanel;


		panel.webview.html = this.getWebviewContent(panel.webview);
		panel.iconPath = asAbsolutePath('resources/icons/gitops-logo.png');

		// user closes the panel or when the panel is closed programmatically
		panel.onDidDispose(() => this.dispose(), null, this.disposables);

		return panel;
	}

	// Use DOM message events to pass parameters to the webview app
	// https://blog.kylekukshtel.com/game-data-editor-vscode-part-3
	private listenDidReceiveMessage() {
		this.panel.webview.onDidReceiveMessage(
			(message: any) => {
				if(message.action === 'init-view') {
					this.panel.webview.postMessage({
						type: 'set-params',
						params: this.webviewParams,
					});
				} else {
					this.messageReceiver(message, this.panel);
				}
			},
			undefined,
			this.disposables,
		);
	}


	private getWebviewContent(webview: Webview) {
		// The CSS file from the SolidJS build output
		const stylesUri = getUri(webview, this.extensionUri, ['build', 'assets', 'index.css']);
		// The JS file from the SolidJS build output
		const scriptUri = getUri(webview, this.extensionUri, ['build', 'assets', 'index.js']);

		// Tip: Install the es6-string-html VS Code extension to enable code highlighting below
		return /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<link rel="stylesheet" type="text/css" href="${stylesUri}">
					<title>${this.title}</title>
				</head>
				<body>
					<div id="root"></div>
					<script type="module" src="${scriptUri}"></script>
				</body>
			</html>
		`;
	}
}
