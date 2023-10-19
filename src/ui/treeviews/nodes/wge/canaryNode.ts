import { Canary } from 'types/flux/canary';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { NodeContext } from 'types/nodeContext';
import { ToolkitNode } from '../source/toolkitNode';

export class CanaryNode extends ToolkitNode {
	resource!: Canary;

	constructor(canary: Canary) {
		super(canary);

		this.makeCollapsible();
	}

	get revision() {
		// return shortenRevision(this.resource.status.lastAppliedRevision);
		return `${this.resource.status.phase} ${this.resource.status.lastAppliedSpec || ''}`;
	}

	get contexts() {
		const contextsArr: string[] = [Kind.Canary];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
