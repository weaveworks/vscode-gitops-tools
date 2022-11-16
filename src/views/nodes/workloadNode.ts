import { MarkdownString } from 'vscode';
import { HelmRelease } from '../../kubernetes/types/flux/helmRelease';
import { DeploymentCondition } from '../../kubernetes/types/kubernetesTypes';
import { Kustomize } from '../../kubernetes/types/flux/kustomize';
import { createMarkdownError, createMarkdownHr, createMarkdownTable } from '../../utils/markdownUtils';
import { TreeNode, TreeNodeIcon } from './treeNode';

/**
 * Base class for all Workload tree view items.
 */
export class WorkloadNode extends TreeNode {

	/**
	 * Whether or not the application failed to reconcile.
	 */
	isReconcileFailed = false;

	resource: Kustomize | HelmRelease;

	constructor(label: string, resource: Kustomize | HelmRelease) {
		super(label);

		this.resource = resource;

		this.updateStatus(resource);
	}

	/**
	 * Find condition with the "Ready" type or
	 * return first one if "Ready" not found.
	 *
	 * @param conditions "status.conditions" of the workload
	 */
	findReadyOrFirstCondition(conditions?: DeploymentCondition | DeploymentCondition[]): DeploymentCondition | undefined {
		if (Array.isArray(conditions)) {
			return conditions.find(condition => condition.type === 'Ready') || conditions[0];
		} else {
			return conditions;
		}
	}

	/**
	 * Update workload status with showing error icon when reconcile has failed.
	 * @param workload target resource
	 */
	updateStatus(workload: Kustomize | HelmRelease): void {
		const condition = this.findReadyOrFirstCondition(workload.status.conditions);

		if (condition?.status === 'True') {
			this.isReconcileFailed = false;
			this.setIcon(TreeNodeIcon.Success);
		} else {
			this.isReconcileFailed = true;
			this.setIcon(TreeNodeIcon.Error);
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
	 * @param workload Kustomize or HelmRelease kubernetes object.
	 * @returns Markdown string to use for Source tree view item tooltip.
	 */
	getMarkdownHover(workload: Kustomize | HelmRelease): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(workload);

		// show status in hover when source fetching failed
		if (this.isReconcileFailed) {
			const readyCondition = this.findReadyOrFirstCondition(workload.status.conditions);
			createMarkdownHr(markdown);
			createMarkdownError('Status message', readyCondition?.message, markdown);
			createMarkdownError('Status reason', readyCondition?.reason, markdown);
		}

		return markdown;
	}
}
