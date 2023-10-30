import { getCanaryChildren } from 'cli/kubernetes/kubectlGet';
import { currentContextData } from 'data/contextData';
import { Canary } from 'types/flux/canary';
import { NodeContext } from 'types/nodeContext';
import { InfoNode, infoNodes } from 'utils/makeTreeviewInfoNode';
import { groupNodesByNamespace } from 'utils/treeNodeUtils';
import { AnyResourceNode } from '../anyResourceNode';
import { TreeNode } from '../treeNode';
import { WgeNode } from './wgeNodes';

export class CanaryNode extends WgeNode {
	resource!: Canary;

	get revision() {
		// return shortenRevision(this.resource.status.lastAppliedRevision);
		return `${this.resource.status.phase} ${this.resource.status.lastAppliedSpec || ''}`;
	}

	get contexts() {
		return [NodeContext.HasWgePortal];
	}

	get wgePortalQuery() {
		const name = this.resource.metadata.name;
		const namespace = this.resource.metadata.namespace || 'default';
		const clusterName = currentContextData().contextName;

		return `canary_details/details?clusterName=${clusterName}&name=${name}&namespace=${namespace}`;
	}



	async updateChildren() {
		// deployment/<targetRef.name>-primary
		if(!this.resource.metadata.name) {
			return;
		}

		this.children = infoNodes(InfoNode.Loading);
		this.redraw();

		const [children, primary] = await Promise.all([getCanaryChildren(this.resource.metadata.name), getCanaryChildren(`${this.resource.metadata.name}-primary`)]);
		const canaryChildren = [...children, ...primary];

		if (!canaryChildren) {
			this.children = infoNodes(InfoNode.FailedToLoad);
			this.redraw();
			return;
		}

		if (canaryChildren.length === 0) {
			this.children = [new TreeNode('No Resources')];
			this.redraw();
			return;
		}

		const childrenNodes = canaryChildren.map(child => new AnyResourceNode(child, this.dataProvider));
		const [groupedNodes, clusterScopedNodes] = await groupNodesByNamespace(childrenNodes);
		this.children = [...groupedNodes, ...clusterScopedNodes];

		this.redraw();
		return;
	}

}
