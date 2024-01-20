import * as shell from 'cli/shell/exec';
import { Uri, window } from 'vscode';

export async function kubectlApplyPath(uri?: Uri) {
	uri ??= window.activeTextEditor?.document.uri;
	if(uri) {
		return await shell.execWithOutput(`kubectl apply -f ${uri.fsPath}`);
	}
}
export async function kubectlDeletePath(uri?: Uri) {
	uri ??= window.activeTextEditor?.document.uri;
	if(uri) {
		return await shell.execWithOutput(`kubectl delete -f ${uri.fsPath}`);
	}
}

export async function kubectlApplyKustomization(uri?: Uri) {
	if(uri) {
		return await shell.execWithOutput(`kubectl apply -k ${uri.fsPath}`);
	}
}
