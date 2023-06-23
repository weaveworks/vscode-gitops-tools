import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { tim } from 'tinytim';
import { asAbsolutePath } from 'utils/asAbsolutePath';


export function showNewUserGuide() {
	const panel = vscode.window.createWebviewPanel(
		'gitopsNewUserGuide', // Identifies the type of the webview. Used internally
		'Welcome to GitOps - New User Guide',
		vscode.ViewColumn.One, // Editor column to show the new webview panel in.
		{
			enableScripts: false,
		},

	);

	panel.iconPath = asAbsolutePath('resources/icons/gitops-logo.png');
	panel.webview.html = getWebviewContent(panel.webview);
}

function getWebviewContent(webview: vscode.Webview) {

	const styleResetPath = webview.asWebviewUri(asAbsolutePath('media/reset.css'));
	const styleVSCodePath = webview.asWebviewUri(asAbsolutePath('media/vscode.css'));
	const styleNewUserGuide = webview.asWebviewUri(asAbsolutePath('media/newUserGuide.css'));

	const images = [
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/01-enable-gitops.gif')),
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/02-create-source.gif')),
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/03-describe-source.gif')),
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/04-create-kustomization.gif')),
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/05-workloads.gif')),
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/06-reconcile.gif')),
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/07-logs.png')),
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/08-trace.png')),
		webview.asWebviewUri(asAbsolutePath('resources/images/newUserGuide/09-docs.png')),
	];


	const htmlTemplate = readFileSync(asAbsolutePath('media/newUserGuide.html').fsPath).toString();
	const htmlBody = tim(htmlTemplate, {images: images});

	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link rel='stylesheet' href='${styleResetPath}' />
			<link rel='stylesheet' href='${styleVSCodePath}' />
			<link rel='stylesheet' href='${styleNewUserGuide}' />
			<title>Welcome to GitOps - New User Guide</title>
		</head>
		<body>
			${htmlBody}
		</body>

	</html>`;
}

