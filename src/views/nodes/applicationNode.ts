import { MarkdownString } from 'vscode';
import { HelmRelease } from '../../kubernetes/helmRelease';
import { Kustomize } from '../../kubernetes/kustomize';
import { createMarkdownTable } from '../../utils/stringUtils';
import { TreeNode } from './treeNode';

/**
 * Base class for all Application tree view items.
 */
export class ApplicationNode extends TreeNode {

	resource!: Kustomize | HelmRelease;

	/**
	 * Creates markdwon string for Application tree view item tooltip.
	 * @param application Kustomize or HelmRelease application object.
	 * @returns Markdown string to use for Application tree view item tooltip.
	 */
	getMarkdown(application: Kustomize | HelmRelease): MarkdownString {
		return createMarkdownTable(application);
	}

}
