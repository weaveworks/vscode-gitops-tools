import { MarkdownString, ThemeColor, ThemeIcon } from 'vscode';
import { Bucket } from '../../kubernetes/bucket';
import { GitRepository } from '../../kubernetes/gitRepository';
import { HelmRepository } from '../../kubernetes/helmRepository';
import { createMarkdownTable, shortenRevision } from '../../utils/stringUtils';
import { TreeNode } from './treeNode';

/**
 * Base class for all the Source tree view items.
 */
export class SourceNode extends TreeNode {

	/**
	 * Whether or not the source failed to fetch.
	 */
	isFetchFailed = false;

	constructor(label: string, source: GitRepository | HelmRepository | Bucket) {
		super(label);

		// update fetch failed status (should go before hover)
		this.updateStatus(source);

		// show shortened revision in node description
		this.updateRevision(source);

		// update hover tooltip
		this.tooltip = this.getMarkdown(source);
	}

	/**
	 * Creates markdwon string for Source tree view item tooltip.
	 * @param source GitRepository, HelmRepository or Bucket kubernetes object.
	 * @returns Markdown string to use for Source tree view item tooltip.
	 */
	getMarkdown(source: GitRepository | HelmRepository | Bucket): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(source);

		// show status in hover when source fetching failed
		if (this.isFetchFailed) {
			markdown.appendMarkdown('\n\n---\n\n');
			markdown.appendMarkdown(`<span style="color:#f14c4c;">$(error)</span> Status message: ${source.status.conditions?.[0].message}\n\n`);
			markdown.appendMarkdown(`<span style="color:#f14c4c;">$(error)</span> Status reason: \`${source.status.conditions?.[0].reason}\`\n\n`);
		}

		return markdown;
	}

	/**
	 * Update source status with showing error icon when fetch failed.
	 * @param source target source
	 */
	updateStatus(source: GitRepository | HelmRepository | Bucket) {
		if (source.status.conditions?.[0].status === 'False') {
			this.isFetchFailed = true;
			this.setIcon(new ThemeIcon('error', new ThemeColor('editorError.foreground')));
		} else {
			this.isFetchFailed = false;
			this.setIcon(new ThemeIcon('pass', new ThemeColor('terminal.ansiGreen')));
		}
	}

	/**
	 * Show shortened revision in node description
	 */
	updateRevision(source: GitRepository | HelmRepository | Bucket) {
		this.description = shortenRevision(source.status.artifact?.revision);

		if (this.isFetchFailed) {
			this.description = `${source.status.conditions?.[0].reason}`;
		}
	}
}
