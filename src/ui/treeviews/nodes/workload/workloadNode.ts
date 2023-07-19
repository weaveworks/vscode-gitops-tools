import { MarkdownString } from 'vscode';

import { HelmRelease } from 'types/flux/helmRelease';
import { Kustomization } from 'types/flux/kustomization';
import { Condition } from 'types/kubernetes/kubernetesTypes';
import { createMarkdownError, createMarkdownHr, createMarkdownTable } from 'utils/markdownUtils';
import { shortenRevision } from 'utils/stringUtils';
import { TreeNode, TreeNodeIcon } from '../treeNode';
import { FluxWorkloadObject } from 'types/flux/object';

/**
 * Base class for all Workload tree view items.
 */
export class WorkloadNode extends TreeNode {

	/**
	 * Whether or not the application failed to reconcile.
	 */
	isReconcileFailed = false;

	resource: FluxWorkloadObject;

	constructor(label: string, resource: FluxWorkloadObject) {
		super(`${resource.kind}: ${label}`);

		this.resource = resource;

		this.updateStatus();
	}

	/**
	 * Find condition with the "Ready" type or
	 * return first one if "Ready" not found.
	 *
	 * @param conditions "status.conditions" of the workload
	 */
	findReadyOrFirstCondition(conditions?: Condition | Condition[]): Condition | undefined {
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
	updateStatus(): void {
		const condition = this.findReadyOrFirstCondition(this.resource.status.conditions);

		if (condition?.status === 'True') {
			this.isReconcileFailed = false;
			this.setIcon(TreeNodeIcon.Success);
		} else {
			this.isReconcileFailed = true;
			this.setIcon(TreeNodeIcon.Error);
		}
	}

	get tooltip() {
		const md = this.getMarkdownHover(this.resource);
		return md;
	}

	// @ts-ignore
	get description() {
		const isSuspendIcon = this.resource.spec?.suspend ? '⏸ ' : '';
		let revisionOrError = '';

		if (this.isReconcileFailed) {
			revisionOrError = `${this.findReadyOrFirstCondition(this.resource.status.conditions)?.reason || ''}`;
		} else {
			revisionOrError = shortenRevision(this.resource.status.lastAppliedRevision);
		}
		return `${isSuspendIcon}${revisionOrError}`;
	}

	/**
	 * Creates markdwon string for Source tree view item tooltip.
	 * @param workload Kustomize or HelmRelease kubernetes object.
	 * @returns Markdown string to use for Source tree view item tooltip.
	 */
	getMarkdownHover(workload: Kustomization | HelmRelease): MarkdownString {
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
