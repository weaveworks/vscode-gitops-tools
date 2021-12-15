import { MarkdownString } from 'vscode';
import { Bucket } from '../../kubernetes/bucket';
import { GitRepository } from '../../kubernetes/gitRepository';
import { HelmRepository } from '../../kubernetes/helmRepository';
import { createMarkdownError, createMarkdownHr, createMarkdownTable } from '../../utils/markdownUtils';
import { shortenRevision } from '../../utils/stringUtils';
import { TreeNode, TreeNodeIcon } from './treeNode';

/**
 * Base class for all the Source tree view items.
 */
export class SourceNode extends TreeNode {

	resource: GitRepository | HelmRepository | Bucket;

	/**
	 * Whether or not the source failed to reconcile.
	 */
	isReconcileFailed = false;

	constructor(label: string, source: GitRepository | HelmRepository | Bucket) {
		super(label);

		this.resource = source;

		// update reconciliation status
		this.updateStatus(source);
	}

	get tooltip() {
		return this.getMarkdownHover(this.resource);
	}

	// @ts-ignore
	get description() {
		const isSuspendIcon = this.resource.spec?.suspend ? '⏸ ' : '';
		let revisionOrError = '';

		if (this.isReconcileFailed) {
			revisionOrError = `${this.resource.status.conditions?.[0].reason}`;
		} else {
			revisionOrError = shortenRevision(this.resource.status.artifact?.revision);
		}

		return `${isSuspendIcon}${revisionOrError}`;
	}

	/**
	 * Creates markdwon string for Source tree view item tooltip.
	 * @param source GitRepository, HelmRepository or Bucket kubernetes object.
	 * @returns Markdown string to use for Source tree view item tooltip.
	 */
	getMarkdownHover(source: GitRepository | HelmRepository | Bucket): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(source);

		// show status in hover when source fetching failed
		if (this.isReconcileFailed) {
			createMarkdownHr(markdown);
			createMarkdownError('Status message', source.status.conditions?.[0].message, markdown);
			createMarkdownError('Status reason', source.status.conditions?.[0].reason, markdown);
		}

		return markdown;
	}

	/**
	 * Update source status with showing error icon when fetch failed.
	 * @param source target source
	 */
	updateStatus(source: GitRepository | HelmRepository | Bucket) {
		if (source.status.conditions?.[0].status === 'False') {
			this.setIcon(TreeNodeIcon.Error);
			this.isReconcileFailed = true;
		} else {
			this.setIcon(TreeNodeIcon.Success);
			this.isReconcileFailed = false;
		}
	}
}
