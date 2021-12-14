import { window } from 'vscode';

export function showWorkloadsHelpMessage() {
	window.showInformationMessage('Workloads include Helm Releases and Kustomizations, as well as a tree of all other objects created by them.', { modal: true });
}
