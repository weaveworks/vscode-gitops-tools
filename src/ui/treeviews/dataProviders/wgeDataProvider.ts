import { getCanaries, getCanaryChildren, getGitOpsSet, getGitOpsTemplates, getPipelines } from 'cli/kubernetes/kubectlGet';
import { ContextData } from 'data/contextData';
import { InfoNode, infoNodes } from 'utils/makeTreeviewInfoNode';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { groupNodesByNamespace } from 'utils/treeNodeUtils';
import { AnyResourceNode } from '../nodes/anyResourceNode';
import { TreeNode } from '../nodes/treeNode';
import { CanaryNode } from '../nodes/wge/canaryNode';
import { GitOpsSetNode } from '../nodes/wge/gitOpsSetNode';
import { GitOpsTemplateNode } from '../nodes/wge/gitOpsTemplateNode';
import { PipelineNode } from '../nodes/wge/pipelineNode';
import { CanariesContainerNode, GitOpsSetsContainerNode, PipelinesContainerNode, TemplatesContainerNode } from '../nodes/wge/wgeContainerNodes';
import { AsyncDataProvider } from './asyncDataProvider';

export class WgeDataProvider extends AsyncDataProvider {
	protected viewData(contextData: ContextData) {
		return contextData.viewData.wge;
	}

	async loadRootNodes() {
		const nodes = [];

		const [templates, canaries, pipelines, gitopssets] = await Promise.all([
			// Fetch all workloads
			getGitOpsTemplates(),
			getCanaries(),
			getPipelines(),
			// Cache namespaces to group the nodes
			getGitOpsSet(),
		]);


		// TEMPLATES
		const ts = new TemplatesContainerNode();
		nodes.push(ts);

		for (const t of sortByMetadataName(templates)) {
			const node = new GitOpsTemplateNode(t);
			ts.children.push(node);
		}

		// CANARIES
		const cs = new CanariesContainerNode();
		nodes.push(cs);

		for (const c of sortByMetadataName(canaries)) {
			const node = new CanaryNode(c);
			cs.children.push(node);
		}
		[cs.children] = await groupNodesByNamespace(cs.children, false, true);

		// PIPELINES
		const ps = new PipelinesContainerNode();
		nodes.push(ps);

		for (const p of sortByMetadataName(pipelines)) {
			const node =  new PipelineNode(p);
			ps.children.push(node);
		}
		[ps.children] = await groupNodesByNamespace(ps.children, false, true);


		// GITOPSSETS
		const gops = new GitOpsSetsContainerNode();
		nodes.push(gops);

		for (const g of sortByMetadataName(gitopssets)) {
			const node = new GitOpsSetNode(g);
			gops.children.push(node);
		}
		[gops.children] = await groupNodesByNamespace(gops.children, false, true);


		return nodes;
	}


	async updateCanaryChildren(node: CanaryNode) {
		// deployment/<targetRef.name>-primary
		if(!node.resource.metadata?.name) {
			return;
		}

		node.children = infoNodes(InfoNode.Loading);


		const [children, primary] = await Promise.all([getCanaryChildren(node.resource.metadata.name), getCanaryChildren(`${node.resource.metadata.name}-primary`)]);
		const workloadChildren = [...children, ...primary];

		if (!workloadChildren) {
			node.children = infoNodes(InfoNode.FailedToLoad);
			this.redraw(node);
			return;
		}

		if (workloadChildren.length === 0) {
			node.children = [new TreeNode('No Resources')];
			this.redraw(node);
			return;
		}

		const childrenNodes = workloadChildren.map(child => new AnyResourceNode(child));
		const [groupedNodes, clusterScopedNodes] = await groupNodesByNamespace(childrenNodes);
		node.children = [...groupedNodes, ...clusterScopedNodes];

		this.redraw(node);
		return;
	}

}


