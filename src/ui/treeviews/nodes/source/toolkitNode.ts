import { FluxObject } from 'types/flux/object';
import { Condition } from 'types/kubernetes/kubernetesTypes';
import { createMarkdownError, createMarkdownHr, createMarkdownTable } from 'utils/markdownUtils';
import { TreeNode, TreeNodeIcon } from '../treeNode';

export enum ReconcileState {
	Ready,
	Failed,
	Progressing,
}

export class ToolkitNode extends TreeNode {
	resource: FluxObject;
	reconcileState: ReconcileState = ReconcileState.Progressing;

	constructor(resource: FluxObject) {
		const label = resource.metadata?.name || 'unknown';
		super(`${resource.kind}: ${label}`);

		this.resource = resource;
		this.updateStatus();
	}

	/**
	 * Update status with showing error icon when fetch failed.
	 * @param source target source
	 */
	updateStatus() {
		const condition = this.readyOrFirstCondition;
		if (condition?.status === 'True') {
			this.reconcileState = ReconcileState.Ready;
			this.setIcon(TreeNodeIcon.Success);
		} else if (condition?.reason === 'Progressing') {
			this.reconcileState = ReconcileState.Progressing;
			this.setIcon(TreeNodeIcon.Progressing);
		} else {
			this.reconcileState = ReconcileState.Failed;
			this.setIcon(TreeNodeIcon.Error);
		}
	}

	/**
	 * Find condition with the "Ready" type or
	 * return first one if "Ready" not found.
	 */
	get readyOrFirstCondition(): Condition | undefined {
		const conditions = this.resource.status.conditions;

		if (Array.isArray(conditions)) {
			return conditions.find(condition => condition.type === 'Ready') || conditions[0];
		} else {
			return conditions;
		}
	}

	get tooltip() {
		const markdown = createMarkdownTable(this.resource);
		// show status in hoverwhat failed
		if (!this.resourceIsReady) {
			createMarkdownHr(markdown);
			createMarkdownError('Status message', this.readyOrFirstCondition?.message, markdown);
			createMarkdownError('Status reason', this.readyOrFirstCondition?.reason, markdown);
		}

		return markdown;
	}

	get resourceIsReady(): boolean {
		return this.reconcileState === ReconcileState.Ready;
	}

	get resourceIsProgressing(): boolean {
		return this.reconcileState === ReconcileState.Progressing;
	}

	// @ts-ignore
	get description() {
		const isSuspendIcon = this.resource.spec?.suspend ? '⏸ ' : '';
		let revisionOrError = '';

		if (!this.resourceIsReady) {
			revisionOrError = `${this.readyOrFirstCondition?.reason || ''}`;
		} else {
			revisionOrError = this.revision;
		}

		return `${isSuspendIcon}${revisionOrError}`;
	}

	get revision(): string {
		return 'unknown';
	}
}
