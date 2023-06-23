import { MarkdownString, ThemeColor, ThemeIcon } from 'vscode';
import { GitOpsTemplate } from 'types/flux/gitOpsTemplate';
import { KubernetesObjectKinds } from 'types/kubernetes/kubernetesTypes';
import { createMarkdownTable } from 'utils/markdownUtils';
import { TreeNode } from './treeNode';

/**
 * Base class for all the Source tree view items.
 */
export class GitOpsTemplateNode extends TreeNode {
	resource: GitOpsTemplate;

	constructor(template: GitOpsTemplate) {
		super(template.metadata.name || 'No name');

		this.resource = template;

		this.setIcon(new ThemeIcon('notebook-render-output', new ThemeColor('editorWidget.foreground')));
	}

	get tooltip() {
		return this.getMarkdownHover(this.resource);
	}

	// @ts-ignore
	get description() {
		// return 'Description';
		return false;
	}

	getMarkdownHover(template: GitOpsTemplate): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(template);
		return markdown;
	}

	get contexts() {
		return [KubernetesObjectKinds.GitOpsTemplate];
	}
}
