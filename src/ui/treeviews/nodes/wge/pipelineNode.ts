import { Pipeline } from 'types/flux/pipeline';
import { NodeContext } from 'types/nodeContext';
import { TreeNode } from '../treeNode';
import { PipelineEnvironmentNode } from './environmentNode';
import { WgeNode } from './wgeNodes';

export class PipelineNode extends WgeNode {
	resource!: Pipeline;

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


	async createPromotionNodes() {
		return [];
	}

}
