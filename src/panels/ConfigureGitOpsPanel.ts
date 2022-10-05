import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from 'vscode';
import { asAbsolutePath } from '../extensionContext';
import { GitInfo } from '../git/getOpenedFolderGitInfo';
import { getUri } from '../utils/getUri';
import { ClusterInfo } from '../views/treeViews';
import { submitConfigureGitOps } from './configureGitOps';


type WebviewParameters = {
	clusterInfo: ClusterInfo;
	gitInfo: GitInfo | undefined;
	namespaces: string[];
	sources: string[];
	selectSourceTab: boolean;
	selectedSource: string;
};


let panel: WebviewPanel | undefined;
const disposables: Disposable[] = [];
let webviewParams: WebviewParameters;


export function createOrShowConfigureGitOpsPanel(extensionUri: Uri, params: WebviewParameters) {
	webviewParams = params;

	if (panel) {
		// If the webview panel already exists reveal it
		panel.webview.postMessage({
			type: 'set-params',
			params: webviewParams,
		});
		panel.reveal(ViewColumn.One);
		return;
	}

	// If a webview panel does not already exist create and show a new one
	panel = window.createWebviewPanel(
		// Panel view type
		'showConfigureGitOps',
		// Panel title
		'Configure GitOps',
		// The editor column the panel should be displayed in
		ViewColumn.One,
		// Extra panel configurations
		{
			enableScripts: true,
		}) as WebviewPanel;


	panel.webview.html = getWebviewContent(panel.webview, extensionUri, true);
	panel.iconPath = asAbsolutePath('resources/icons/gitops-logo.png');


	listenDidReceiveMessage(panel.webview);

	// user closes the panel or when the panel is closed programmatically
	panel.onDidDispose(dispose, null, disposables);
}


function dispose() {
	panel?.dispose();

	// Dispose of all disposables (i.e. commands) for the current webview panel
	while (disposables.length) {
		const disposable = disposables.pop();
		if (disposable) {
			disposable.dispose();
		}
	}

	panel = undefined;
}

// Use DOM message events to pass parameters to the webview app
// https://blog.kylekukshtel.com/game-data-editor-vscode-part-3
function listenDidReceiveMessage(webview: Webview) {
	webview.onDidReceiveMessage(
		(message: any) => {
			switch (message.type) {
				case 'init-view':
					panel?.webview.postMessage({
						type: 'set-params',
						params: webviewParams,
					});
					return;
				case 'submit':
					submitConfigureGitOps(message.data);
					panel?.dispose();
					return;
			}
		},
		undefined,
		disposables,
	);
}


function getWebviewContent(webview: Webview, extensionUri: Uri, showSelectSource: boolean) {
	// The CSS file from the SolidJS build output
	const stylesUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.css']);
	// The JS file from the SolidJS build output
	const scriptUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.js']);

	// Tip: Install the es6-string-html VS Code extension to enable code highlighting below
	return /*html*/ `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="stylesheet" type="text/css" href="${stylesUri}">
				<title>Configure GitOps</title>
				<script>
					console.log('orly?');
					window['showSelectSource'] = '${showSelectSource}';
				</script>
			</head>
			<body>
				<div id="root"></div>
				<script type="module" src="${scriptUri}"></script>
			</body>
		</html>
	`;
}

