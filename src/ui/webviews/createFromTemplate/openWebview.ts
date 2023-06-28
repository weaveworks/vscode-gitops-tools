import { Uri, window } from 'vscode';

import { extensionContext } from 'extension';
import { GitOpsTemplate } from 'types/flux/gitOpsTemplate';
import { WebviewBackend } from '../WebviewBackend';
import { receiveMessage } from './receiveMessage';

let webview: WebviewBackend | undefined;


export async function openCreateFromTemplatePanel(template: GitOpsTemplate) {
	if(!template.spec.params) {
		return;
	}

	const result = await window.showInformationMessage('Select folder for template results (Ex: fleet-infra/clusters)', {modal: true}, 'Ok');
	if(result !== 'Ok') {
		return;
	}

	const folders = await window.showOpenDialog({title: 'Clusters manifests folder', canSelectFiles: false, canSelectFolders: true});
	const folder = folders ? folders[0].fsPath : '';
	const webviewParams = {
		name: template.metadata?.name,
		namespace: template.metadata?.namespace,
		description: template.spec.description,
		params: template.spec.params,
		folder,
	};

	webview?.dispose();

	const extensionUri = extensionContext.extensionUri;
	const uri = Uri.joinPath(extensionUri, 'webview-ui', 'createFromTemplate');
	webview = new WebviewBackend('Create from Template', uri, webviewParams, receiveMessage);
}
