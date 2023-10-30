import { getResource } from 'cli/kubernetes/kubectlGet';
import { Pipeline } from 'types/flux/pipeline';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { NodeContext } from 'types/nodeContext';
import { InfoNode, infoNodes } from 'utils/makeTreeviewInfoNode';
import { makeTreeNode } from '../makeTreeNode';
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
		const name = this.resource.metadata?.name;
		const namespace = this.resource.metadata?.namespace || 'default';

		return `pipelines/details/status?kind=Pipeline&name=${name}&namespace=${namespace}`;
	}


	async updateChildren() {
		if(!this.resource.metadata?.name) {
			return;
		}

		this.children = infoNodes(InfoNode.Loading);
		this.redraw();

		const [promotionNodes, envNodes] = await Promise.all([this.createPromotionNodes(), this.createEnvNodes()]);


		this.children = [...promotionNodes, ...envNodes];
		this.redraw();
		return;
	}


	async createAppRefNode(): Promise<TreeNode | undefined> {
		const appKind = this.resource.spec.appRef.kind;
		const appName = this.resource.spec.appRef.name;
		const ns  = this.resource.metadata?.namespace;

		if(!appKind || !appName || !ns) {
			return;
		}

		const app = await getResource(appName, ns, appKind as Kind);
		if(!app) {
			return;
		}

		const appNode = makeTreeNode(app, this.dataProvider);
		if(appNode) {
			appNode.updateChildren();
			return appNode;
		}
	}

	async createEnvNodes(): Promise<TreeNode[]> {
		const envNodes = [];
		for(const env of this.resource.spec.environments) {
			const envNode = new PipelineEnvironmentNode(env);
			this.children.push(envNode);
			envNodes.push(envNode);
		}

		return envNodes;
	}



	async createPromotionNodes() {
		return [];
	}

}
