import { fluxTools } from 'cli/flux/fluxTools';
import { getHelmReleaseChildren, getHelmReleases, getKustomizations } from 'cli/kubernetes/kubectlGet';
import { getNamespaces } from 'cli/kubernetes/kubectlGetNamespace';
import { ContextData } from 'data/contextData';
import { statusBar } from 'ui/statusBar';
import { InfoNode, infoNodes } from 'utils/makeTreeviewInfoNode';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { addFluxTreeToNode, groupNodesByNamespace } from 'utils/treeNodeUtils';
import { AnyResourceNode } from '../nodes/anyResourceNode';
import { TreeNode } from '../nodes/treeNode';
import { HelmReleaseNode } from '../nodes/workload/helmReleaseNode';
import { KustomizationNode } from '../nodes/workload/kustomizationNode';
import { WorkloadNode } from '../nodes/workload/workloadNode';
import { KubernetesObjectDataProvider } from './kubernetesObjectDataProvider';

/**-
 * Defines data provider for loading Kustomizations
 * and Helm Releases in Workloads Tree View.
 */
export class WorkloadDataProvider extends KubernetesObjectDataProvider {
	protected viewData(contextData: ContextData) {
		return contextData.viewData.workload;
	}

	/**
   * Creates Workload tree nodes for the currently selected kubernetes cluster.
   */
	async loadRootNodes() {
		statusBar.startLoadingTree();

		const workloadNodes: WorkloadNode[] = [];

		const [kustomizations, helmReleases, _] = await Promise.all([
			// Fetch all workloads
			getKustomizations(),
			getHelmReleases(),
			// Cache namespaces to group the nodes
			getNamespaces(),
		]);

		for (const kustomizeWorkload of sortByMetadataName(kustomizations)) {
			workloadNodes.push(new KustomizationNode(kustomizeWorkload));
		}

		for (const helmRelease of sortByMetadataName(helmReleases)) {
			workloadNodes.push(new HelmReleaseNode(helmRelease));
		}

		for (const node of workloadNodes) {
			this.updateWorkloadChildren(node);
		}

		statusBar.stopLoadingTree();

		const [groupedNodes] = await groupNodesByNamespace(workloadNodes, false, true);
		return groupedNodes;
	}

	/**
	 * Fetch all kubernetes resources that were created by a kustomize/helmRelease
	 * and add them as child nodes of the workload.
	 * @param workloadNode target workload node
	 */
	async updateWorkloadChildren(workloadNode: WorkloadNode) {
		workloadNode.children = infoNodes(InfoNode.Loading);

		if (workloadNode instanceof KustomizationNode) {
			this.updateKustomizationChildren(workloadNode);
		} else if (workloadNode instanceof HelmReleaseNode) {
			this.updateHelmReleaseChildren(workloadNode);
		}
	}

	async updateKustomizationChildren(node: KustomizationNode) {
		const name = node.resource.metadata?.name || '';
		const namespace = node.resource.metadata?.namespace || '';
		const resourceTree = await fluxTools.tree(name, namespace);

		if (!resourceTree) {
			node.children = infoNodes(InfoNode.FailedToLoad);
			this.redraw(node);
			return;
		}

		if (!resourceTree.resources) {
			node.children = [new TreeNode('No Resources')];
			this.redraw(node);
			return;
		}

		node.children = [];
		await addFluxTreeToNode(node, resourceTree.resources);
		this.redraw(node);
	}


	async updateHelmReleaseChildren(node: HelmReleaseNode) {
		const name = node.resource.metadata?.name || '';
		const namespace = node.resource.metadata?.namespace || '';

		const workloadChildren = await getHelmReleaseChildren(name, namespace);

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
	}



}

