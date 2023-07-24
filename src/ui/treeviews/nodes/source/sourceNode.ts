import { MarkdownString } from 'vscode';

import { Bucket } from 'types/flux/bucket';
import { GitRepository } from 'types/flux/gitRepository';
import { HelmRepository } from 'types/flux/helmRepository';
import { OCIRepository } from 'types/flux/ociRepository';
import { Condition } from 'types/kubernetes/kubernetesTypes';
import { createMarkdownError, createMarkdownHr, createMarkdownTable } from 'utils/markdownUtils';
import { shortenRevision } from 'utils/stringUtils';
import { TreeNode, TreeNodeIcon } from '../treeNode';
import { FluxSourceObject } from 'types/flux/object';

/**
 * Base class for all the Source tree view items.
 */
export class SourceNode extends TreeNode {

	resource: FluxSourceObject;

	/**
	 * Whether or not the source failed to reconcile.
	 */
	isReconcileFailed = false;

	constructor(label: string, source: FluxSourceObject) {
		super(label);

		this.resource = source;

		// update reconciliation status
		this.updateStatus();
	}

	get tooltip() {
		return this.getMarkdownHover(this.resource);
	}

	// @ts-ignore
	get description() {
		const isSuspendIcon = this.resource.spec?.suspend ? '⏸ ' : '';
		let revisionOrError = '';

		if (this.isReconcileFailed) {
			revisionOrError = `${this.findReadyOrFirstCondition(this.resource.status.conditions)?.reason || ''}`;
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
	getMarkdownHover(source: GitRepository | OCIRepository | HelmRepository | Bucket): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(source);

		// show status in hover when source fetching failed
		if (this.isReconcileFailed) {
			const readyCondition = this.findReadyOrFirstCondition(source.status.conditions);
			createMarkdownHr(markdown);
			createMarkdownError('Status message', readyCondition?.message, markdown);
			createMarkdownError('Status reason', readyCondition?.reason, markdown);
		}

		return markdown;
	}

	/**
	 * Find condition with the "Ready" type or
	 * return first one if "Ready" not found.
	 *
	 * @param conditions "status.conditions" of the source
	 */
	findReadyOrFirstCondition(conditions?: Condition[]): Condition | undefined {
		return conditions?.find(condition => condition.type === 'Ready') || conditions?.[0];
	}

	/**
	 * Update source status with showing error icon when fetch failed.
	 * @param source target source
	 */
	updateStatus(): void {
		if (this.findReadyOrFirstCondition(this.resource.status.conditions)?.status === 'True') {
			this.setIcon(TreeNodeIcon.Success);
			this.isReconcileFailed = false;
		} else {
			this.setIcon(TreeNodeIcon.Error);
			this.isReconcileFailed = true;
		}
	}
}
