import { Canary } from 'types/flux/canary';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { NodeContext } from 'types/nodeContext';
import { WorkloadNode } from './workloadNode';

export class CanaryNode extends WorkloadNode {
	resource!: Canary;

	constructor(canary: Canary) {
		super(canary);

		this.makeCollapsible();
	}

	get contexts() {
		const contextsArr: string[] = [Kind.Canary];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
