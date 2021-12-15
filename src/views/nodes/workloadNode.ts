import { MarkdownString } from 'vscode';
import { HelmRelease } from '../../kubernetes/helmRelease';
import { Kustomize } from '../../kubernetes/kustomize';
import { createMarkdownError, createMarkdownHr, createMarkdownTable } from '../../utils/markdownUtils';
import { TreeNode, TreeNodeIcon } from './treeNode';

/**
 * Base class for all Workload tree view items.
 */
export class WorkloadNode extends TreeNode {

	/**
	 * Whether or not the appliication failed to reconcile.
	 */
	isReconcileFailed = false;

	resource: Kustomize | HelmRelease;

	constructor(label: string, resource: Kustomize | HelmRelease) {
		super(label);

		this.resource = resource;

		this.updateStatus(resource);
	}

	/**
	 * Update workload status with showing error icon when reconcile has failed.
	 * @param resource target resource
	 */
	updateStatus(resource: Kustomize | HelmRelease) {
		const conditions = resource.status.conditions;
		const condition = Array.isArray(conditions) ? conditions[0] : conditions;

		if (condition?.status === 'False') {
			this.isReconcileFailed = true;
			this.setIcon(TreeNodeIcon.Error);
		} else {
			this.isReconcileFailed = false;
			this.setIcon(TreeNodeIcon.Success);
		}
	}

	get tooltip() {
		return this.getMarkdownHover(this.resource);
	}

	// @ts-ignore
	get description() {
		const isSuspendIcon = this.resource.spec?.suspend ? '⏸ ' : '';
		return `${isSuspendIcon}${this.resource.kind}`;
	}

	/**
	 * Creates markdwon string for Source tree view item tooltip.
	 * @param resource GitRepository, HelmRepository or Bucket kubernetes object.
	 * @returns Markdown string to use for Source tree view item tooltip.
	 */
	getMarkdownHover(resource: Kustomize | HelmRelease): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(resource);

		// show status in hover when source fetching failed
		if (this.isReconcileFailed) {
			const conditions = resource.status.conditions;
			const condition = Array.isArray(conditions) ? conditions[0] : conditions;
			createMarkdownHr(markdown);
			createMarkdownError('Status message', condition?.message, markdown);
			createMarkdownError('Status reason', condition?.reason, markdown);
		}

		return markdown;
	}
}
