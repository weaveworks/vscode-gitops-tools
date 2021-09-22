import { MarkdownString } from 'vscode';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRepository } from '../kubernetes/helmRepository';
import { createMarkdownTable } from '../utils/stringUtils';
import { TreeNode } from './treeNode';

/**
 * Base class for all the Source tree view items.
 */
 export class SourceNode extends TreeNode {

	/**
	 * Creates markdwon string for Source tree view item tooltip.
	 * @param source GitRepository, HelmRepository or Bucket kubernetes object.
	 * @param showJsonConfig Optional show Json config flag for dev debug.
	 * @returns Markdown string to use for Source tree view item tooltip.
	 */
	 getMarkdown(source: GitRepository | HelmRepository | Bucket,
		showJsonConfig: boolean = false): MarkdownString {

		const markdown: MarkdownString = createMarkdownTable(source);

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(source, null, '  '), 'json');
		}

		return markdown;
	}
}
