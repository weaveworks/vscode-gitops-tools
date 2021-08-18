import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {	
	let disposable = vscode.commands.registerCommand('weave.gitOps.hello', () => {
		vscode.window.showInformationMessage('Hello from Weave GitOps!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
