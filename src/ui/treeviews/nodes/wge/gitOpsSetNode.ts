import { GitOpsSet } from 'types/flux/gitopsset';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { NodeContext } from 'types/nodeContext';
import { ToolkitNode } from '../source/toolkitNode';

export class GitOpsSetNode extends ToolkitNode {
	resource!: GitOpsSet;

	constructor(gos: GitOpsSet) {
		super(gos);

		this.makeCollapsible();
	}

	// get revision() {
	// 	// return shortenRevision(this.resource.status.lastAppliedRevision);
	// 	return `${this.resource.status.phase} ${this.resource.status.lastAppliedSpec || ''}`;
	// }

	get contexts() {
		const contextsArr: string[] = [Kind.GitOpsSet];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
