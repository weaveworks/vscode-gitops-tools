import { MarkdownString } from 'vscode';
import { Bucket } from '../../kubernetes/types/flux/bucket';
import { GitRepository } from '../../kubernetes/types/flux/gitRepository';
import { OCIRepository } from '../../kubernetes/types/flux/ociRepository';
import { HelmRepository } from '../../kubernetes/types/flux/helmRepository';
import { DeploymentCondition } from '../../kubernetes/types/kubernetesTypes';
import { createMarkdownError, createMarkdownHr, createMarkdownTable } from '../../utils/markdownUtils';
import { shortenRevision } from '../../utils/stringUtils';
import { TreeNode, TreeNodeIcon } from './treeNode';

/**
 * Base class for all the Source tree view items.
 */
export class SourceNode extends TreeNode {

	resource: GitRepository | OCIRepository | HelmRepository | Bucket;

	/**
	 * Whether or not the source failed to reconcile.
	 */
	isReconcileFailed = false;

	constructor(label: string, source: GitRepository | OCIRepository | HelmRepository | Bucket) {
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
			revisionOrError = `${this.findReadyOrFirstCondition(this.resource.status.conditions)?.reason}`;
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
	findReadyOrFirstCondition(conditions?: DeploymentCondition[]): DeploymentCondition | undefined {
		return conditions?.find(condition => condition.type === 'Ready') || conditions?.[0];
	}

	/**
	 * Update source status with showing error icon when fetch failed.
	 * @param source target source
	 */
	updateStatus(source: GitRepository | OCIRepository | HelmRepository | Bucket): void {
		if (this.findReadyOrFirstCondition(source.status.conditions)?.status === 'True') {
			this.setIcon(TreeNodeIcon.Success);
			this.isReconcileFailed = false;
		} else {
			this.setIcon(TreeNodeIcon.Error);
			this.isReconcileFailed = true;
		}
	}
}
