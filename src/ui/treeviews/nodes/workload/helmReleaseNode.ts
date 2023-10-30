import { getHelmReleaseChildren } from 'cli/kubernetes/kubectlGet';
import { HelmRelease } from 'types/flux/helmRelease';
import { SimpleDataProvider } from 'ui/treeviews/dataProviders/simpleDataProvider';
import { InfoNode, infoNodes } from 'utils/makeTreeviewInfoNode';
import { shortenRevision } from 'utils/stringUtils';
import { groupNodesByNamespace } from 'utils/treeNodeUtils';
import { AnyResourceNode } from '../anyResourceNode';
import { TreeNode } from '../treeNode';
import { WorkloadNode } from './workloadNode';

/**
 * Defines Helm release tree view item for display in GitOps Workloads tree view.
 */
export class HelmReleaseNode extends WorkloadNode {
	resource!: HelmRelease;
	dataProvider!: SimpleDataProvider;

	/**
	 * Creates new helm release tree view item for display.
	 * @param helmRelease Helm release kubernetes object info.
	 */
	constructor(helmRelease: HelmRelease, dataProvider: SimpleDataProvider) {
		super(helmRelease, dataProvider);

		this.makeCollapsible();
	}

	get revision() {
		return shortenRevision(this.resource.status.lastAppliedRevision);
	}

	async updateChildren() {
		this.children = infoNodes(InfoNode.Loading);
		this.redraw();

		const name = this.resource.metadata.name;
		const namespace = this.resource.metadata.namespace || '';

		const workloadChildren = await getHelmReleaseChildren(name, namespace);

		if (!workloadChildren) {
			this.children = infoNodes(InfoNode.FailedToLoad);
			this.redraw();
			return;
		}

		if (workloadChildren.length === 0) {
			this.children = [new TreeNode('No Resources')];
			this.redraw();
			return;
		}

		const childrenNodes = workloadChildren.map(child => new AnyResourceNode(child, this.dataProvider));
		const [groupedNodes, clusterScopedNodes] = await groupNodesByNamespace(childrenNodes);
		this.children = [...groupedNodes, ...clusterScopedNodes];

		this.redraw();
	}
}
