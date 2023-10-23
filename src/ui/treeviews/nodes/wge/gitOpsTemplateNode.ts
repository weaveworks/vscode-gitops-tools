import { MarkdownString, TreeItemCollapsibleState } from 'vscode';

import { GitOpsTemplate } from 'types/flux/gitOpsTemplate';
import { NodeContext } from 'types/nodeContext';
import { themeIcon } from 'ui/icons';
import { createMarkdownTable } from 'utils/markdownUtils';
import { TreeNode } from '../treeNode';

export enum TemplateType {
	Cluster = 'cluster',
	Application = 'application',
}
/**
 * Base class for all the Source tree view items.
 */
export class GitOpsTemplateNode extends TreeNode {
	resource: GitOpsTemplate;

	constructor(template: GitOpsTemplate) {
		super(template.metadata?.name || 'No name');

		this.resource = template;

		if(this.templateType === 'cluster') {
			this.setIcon(themeIcon('server-environment'));
		} else {
			this.setIcon(themeIcon('preview', 'descriptionForeground'));
		}
		this.collapsibleState = TreeItemCollapsibleState.None;
	}

	get tooltip() {
		return this.getMarkdownHover(this.resource);
	}

	get templateType(): TemplateType {
		return this.resource.metadata?.labels?.['weave.works/template-type'] === 'cluster' ? TemplateType.Cluster : TemplateType.Application;
	}

	// @ts-ignore
	get description() {
		return false;
	}

	getMarkdownHover(template: GitOpsTemplate): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(template);
		return markdown;
	}

	get contexts() {
		return this.templateType === TemplateType.Cluster ? [NodeContext.HasWgePortal] : [];
	}
}
