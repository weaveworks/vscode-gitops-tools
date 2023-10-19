import { ToolkitObject } from 'types/flux/object';
import { Condition, Kind } from 'types/kubernetes/kubernetesTypes';
import { CommonIcon } from 'ui/icons';
import { createMarkdownError, createMarkdownHr, createMarkdownTable } from 'utils/markdownUtils';
import { TreeNode } from '../treeNode';

export enum ReconcileState {
	Ready,
	Failed,
	Progressing,
}

export class ToolkitNode extends TreeNode {
	resource: ToolkitObject;
	reconcileState: ReconcileState = ReconcileState.Progressing;

	constructor(resource: ToolkitObject) {
		super(`${resource.kind}: ${resource.metadata?.name || 'unknown'}`);

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
			this.setCommonIcon(CommonIcon.Success);
		} else if (condition?.reason === 'Progressing' || condition?.reason === 'Promoting' || condition?.reason === 'Finalising') {
			this.reconcileState = ReconcileState.Progressing;
			this.setCommonIcon(CommonIcon.Progressing);
		} else {
			this.reconcileState = ReconcileState.Failed;
			this.setCommonIcon(CommonIcon.Error);
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
		let revisionOrError = '';

		if (!this.resourceIsReady) {
			revisionOrError = `${this.readyOrFirstCondition?.reason || ''}`;
			if(this.resource.kind === Kind.Canary) {
				revisionOrError = `${revisionOrError} ${this.resource.status?.canaryWeight}%`;
			}
		} else {
			revisionOrError = this.revision;
		}

		return `${this.isSuspendIcon}${revisionOrError}`;
	}

	get revision(): string {
		return 'unknown';
	}

	get isSuspendIcon(): string {
		if(this.resource.kind !== Kind.Pipeline) {
			return this.resource.spec?.suspend ? '⏸ ' : '';
		}
		return '';
	}

}
