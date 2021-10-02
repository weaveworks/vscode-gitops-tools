import { MarkdownString } from 'vscode';
import { Bucket } from '../../kubernetes/bucket';
import { GitRepository } from '../../kubernetes/gitRepository';
import { HelmRepository } from '../../kubernetes/helmRepository';
import { createMarkdownTable } from '../../utils/stringUtils';
import { TreeNode } from './treeNode';

/**
 * Base class for all the Source tree view items.
 */
export class SourceNode extends TreeNode {

	/**
	 * Creates markdwon string for Source tree view item tooltip.
	 * @param source GitRepository, HelmRepository or Bucket kubernetes object.
	 * @returns Markdown string to use for Source tree view item tooltip.
	 */
	 getMarkdown(source: GitRepository | HelmRepository | Bucket): MarkdownString {
		return createMarkdownTable(source);
	}
}
