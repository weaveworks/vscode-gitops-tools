import { Pipeline } from 'types/flux/pipeline';
import { NodeContext } from 'types/nodeContext';
import { TreeNode } from '../treeNode';
import { PipelineEnvironmentNode } from './environmentNode';
import { WgeNode } from './wgeNodes';

export class PipelineNode extends WgeNode {
	resource!: Pipeline;

	constructor(pipeline: Pipeline) {
		super(pipeline);
	}

	get revision() {
		const condition = this.readyOrFirstCondition;
		return condition?.lastTransitionTime ? `${condition?.lastTransitionTime.toLocaleString()}` : '';
	}

	get contexts() {
		const promotionContext = this.isManualPromotion ? NodeContext.ManualPromotion : NodeContext.AutoPromotion;
		return [NodeContext.HasWgePortal, promotionContext];
	}

	get wgePortalQuery() {
		const name = this.resource.metadata.name;
		const namespace = this.resource.metadata.namespace || 'default';

		return `pipelines/details/status?kind=Pipeline&name=${name}&namespace=${namespace}`;
	}


	async updateChildren() {
		this.children = await this.createEnvNodes();
		this.redraw();
	}

	async createEnvNodes(): Promise<TreeNode[]> {
		const envNodes = [];
		for(const env of this.resource.spec.environments) {
			const envNode = new PipelineEnvironmentNode(env, this.resource);
			envNode.updateChildren();
			envNodes.push(envNode);
		}

		return envNodes;
	}


	get isManualPromotion() {
		return !!this.resource.spec?.promotion?.manual;
	}

	get isSuspendIcon(): string {
		return this.isManualPromotion ? '⏸ ' : '';
	}


	async createPromotionNodes() {
		return [];
	}

}
