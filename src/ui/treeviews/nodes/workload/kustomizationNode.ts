import { fluxTools } from 'cli/flux/fluxTools';
import { Kustomization } from 'types/flux/kustomization';
import { SimpleDataProvider } from 'ui/treeviews/dataProviders/simpleDataProvider';
import { InfoNode, infoNodes } from 'utils/makeTreeviewInfoNode';
import { shortenRevision } from 'utils/stringUtils';
import { addFluxTreeToNode } from 'utils/treeNodeUtils';
import { TreeNode } from '../treeNode';
import { WorkloadNode } from './workloadNode';

/**
 * Defines Kustomization tree view item for display in GitOps Workload tree view.
 */
export class KustomizationNode extends WorkloadNode {
	resource!: Kustomization;
	dataProvider!: SimpleDataProvider;

	/**
	 * Creates new app kustomization tree view item for display.
	 * @param kustomization Kustomize kubernetes object info.
	 */
	constructor(kustomization: Kustomization, dataProvider: SimpleDataProvider) {
		super(kustomization, dataProvider);

		this.makeCollapsible();
	}

	get revision() {
		return shortenRevision(this.resource.status.lastAppliedRevision);
	}


	async updateChildren() {
		this.children = infoNodes(InfoNode.Loading);
		this.redraw();

		const name = this.resource.metadata?.name || '';
		const namespace = this.resource.metadata?.namespace || '';
		const resourceTree = await fluxTools.tree(name, namespace);

		if (!resourceTree) {
			this.children = infoNodes(InfoNode.FailedToLoad);
			this.redraw();
			return;
		}

		if (!resourceTree.resources) {
			this.children = [new TreeNode('No Resources')];
			this.redraw();
			return;
		}

		this.children = [];
		await addFluxTreeToNode(this, resourceTree.resources);
		this.redraw();
	}

}
