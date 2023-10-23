import { Pipeline } from 'types/flux/pipeline';
import { NodeContext } from 'types/nodeContext';
import { ToolkitNode } from '../toolkitNode';

export class PipelineNode extends ToolkitNode {
	resource!: Pipeline;

	constructor(pipeline: Pipeline) {
		super(pipeline);

		this.makeCollapsible();
	}

	get revision() {
		const condition = this.readyOrFirstCondition;
		return condition?.lastTransitionTime ? `${condition?.lastTransitionTime.toLocaleString()}` : '';
	}

	get contexts() {
		return [NodeContext.HasWgePortal];
	}


	get wgePortalQuery() {
		const name = this.resource.metadata?.name;
		const namespace = this.resource.metadata?.namespace || 'default';

		return `pipelines/details/status?kind=Pipeline&name=${name}&namespace=${namespace}`;
	}
}
