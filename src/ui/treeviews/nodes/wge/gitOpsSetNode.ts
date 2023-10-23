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


	get wgePortalQuery() {
		const name = this.resource.metadata?.name;
		const namespace = this.resource.metadata?.namespace || 'default';

		return `gitopssets/details/status?kind=GitOpsSet&name=${name}&namespace=${namespace}`;
	}
}
