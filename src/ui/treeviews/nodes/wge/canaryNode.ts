import { currentContextData } from 'data/contextData';
import { Canary } from 'types/flux/canary';
import { NodeContext } from 'types/nodeContext';
import { ToolkitNode } from '../toolkitNode';

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
		return [NodeContext.HasWgePortal];
	}


	get wgePortalQuery() {
		const name = this.resource.metadata?.name;
		const namespace = this.resource.metadata?.namespace || 'default';
		const clusterName = currentContextData().contextName;

		return `canary_details/details?clusterName=${clusterName}&name=${name}&namespace=${namespace}`;
	}
}
