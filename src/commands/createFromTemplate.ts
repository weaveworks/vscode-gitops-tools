import * as vscode from 'vscode';
import { GitOpsTemplateNode } from '../treeviews/nodes/gitOpsTemplateNode';
import { openCreateFromTemplatePanel } from '../webview-backend/createFromTemplate/openWebview';

export async function createFromTemplate(templateNode?: GitOpsTemplateNode) {
	// const name = await window.showQuickPick(['cluster-template-development', 'cluster-template-development-plus-kubelogin']);

	if(!templateNode || !templateNode.resource) {
		return;
	}

	// TODO: const resource = yaml.parseDocument(yourYamlFile);
	openCreateFromTemplatePanel(templateNode.resource);
}
