import { getCanaries, getGitOpsSet, getGitOpsTemplates, getPipelines } from 'cli/kubernetes/kubectlGet';
import { ContextData } from 'data/contextData';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { groupNodesByNamespace } from 'utils/treeNodeUtils';
import { CanaryNode } from '../nodes/wge/canaryNode';
import { GitOpsSetNode } from '../nodes/wge/gitOpsSetNode';
import { GitOpsTemplateNode } from '../nodes/wge/gitOpsTemplateNode';
import { PipelineNode } from '../nodes/wge/pipelineNode';
import { CanariesContainerNode, GitOpsSetsContainerNode, PipelinesContainerNode, TemplatesContainerNode } from '../nodes/wge/wgeNodes';
import { AsyncDataProvider } from './asyncDataProvider';

export class WgeDataProvider extends AsyncDataProvider {
	protected viewData(contextData: ContextData) {
		return contextData.viewData.wge;
	}

	async loadRootNodes() {
		const nodes = [];

		const [templates, canaries, pipelines, gitopssets] = await Promise.all([
			getGitOpsTemplates(),
			getCanaries(),
			getPipelines(),
			getGitOpsSet(),
		]);


		// TEMPLATES
		const ts = new TemplatesContainerNode();
		nodes.push(ts);

		for (const t of sortByMetadataName(templates)) {
			const node = new GitOpsTemplateNode(t);
			ts.addChild(node);
		}

		// CANARIES
		const cs = new CanariesContainerNode();
		nodes.push(cs);

		for (const c of sortByMetadataName(canaries)) {
			const node = new CanaryNode(c);
			cs.addChild(node);
			node.updateChildren();
		}
		[cs.children] = await groupNodesByNamespace(cs.children, false, true);

		// PIPELINES
		const ps = new PipelinesContainerNode();
		nodes.push(ps);

		for (const p of sortByMetadataName(pipelines)) {
			const node = new PipelineNode(p);
			ps.addChild(node);
			node.updateChildren();
		}
		[ps.children] = await groupNodesByNamespace(ps.children, false, true);


		// GITOPSSETS
		const gops = new GitOpsSetsContainerNode();
		nodes.push(gops);

		for (const g of sortByMetadataName(gitopssets)) {
			const node = new GitOpsSetNode(g);
			gops.addChild(node);
		}
		[gops.children] = await groupNodesByNamespace(gops.children, false, true);

		return nodes;
	}


}


