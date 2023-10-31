import { currentContextData } from 'data/contextData';
import { GitOpsSet } from 'types/flux/gitopsset';
import { NodeContext } from 'types/nodeContext';
import { WgeNode } from './wgeNodes';

export class GitOpsSetNode extends WgeNode {
	resource!: GitOpsSet;

	constructor(gitOpsSet: GitOpsSet) {
		super(gitOpsSet);

		this.makeUncollapsible();
	}

	get revision() {
		const condition = this.readyOrFirstCondition;
		return condition?.lastTransitionTime ? `${condition?.lastTransitionTime.toLocaleString()}` : '';
	}

	get contexts() {
		return [NodeContext.HasWgePortal];
	}


	get wgePortalQuery() {
		const name = this.resource.metadata.name;
		const namespace = this.resource.metadata.namespace || 'default';
		const clusterName = currentContextData().wgeClusterName;


		return `gitopssets/object/details?clusterName=${clusterName}&name=${name}&namespace=${namespace}`;
	}
}
