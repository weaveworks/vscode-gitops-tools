import { GitOpsSet } from 'types/flux/gitopsset';
import { NodeContext } from 'types/nodeContext';
import { ToolkitNode } from '../toolkitNode';

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
		return [NodeContext.HasWgePortal];
	}
}
