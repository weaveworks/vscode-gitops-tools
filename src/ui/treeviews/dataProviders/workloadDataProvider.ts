import { fluxTools } from 'cli/flux/fluxTools';
import { getChildrenOfWorkload, getHelmReleases, getKustomizations } from 'cli/kubernetes/kubectlGet';
import { getNamespaces } from 'cli/kubernetes/kubectlGetNamespace';
import { setVSCodeContext } from 'extension';
import { ContextId } from 'types/extensionIds';
import { statusBar } from 'ui/statusBar';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { addFluxTreeToNode, groupNodesByNamespace } from 'utils/treeNodeUtils';
import { AnyResourceNode } from '../nodes/anyResourceNode';
import { TreeNode, TreeNodeIcon } from '../nodes/treeNode';
import { HelmReleaseNode } from '../nodes/workload/helmReleaseNode';
import { KustomizationNode } from '../nodes/workload/kustomizationNode';
import { WorkloadNode } from '../nodes/workload/workloadNode';
import { KubernetesObjectDataProvider } from './kubernetesObjectDataProvider';

/**-
 * Defines data provider for loading Kustomizations
 * and Helm Releases in Workloads Tree View.
 */
export class WorkloadDataProvider extends KubernetesObjectDataProvider {
	/**
   * Creates Workload tree nodes for the currently selected kubernetes cluster.
   */
	async loadRootNodes() {
		statusBar.startLoadingTree();

		const workloadNodes: WorkloadNode[] = [];

		setVSCodeContext(ContextId.LoadingWorkloads, true);

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

		setVSCodeContext(ContextId.LoadingWorkloads, false);
		setVSCodeContext(ContextId.NoWorkloads, workloadNodes.length === 0);
		statusBar.stopLoadingTree();

		[this.nodes] = await groupNodesByNamespace(workloadNodes, false, true);
	}

	/**
	 * Fetch all kubernetes resources that were created by a kustomize/helmRelease
	 * and add them as child nodes of the workload.
	 * @param workloadNode target workload node
	 */
	async updateWorkloadChildren(workloadNode: WorkloadNode) {
		workloadNode.children = [new TreeNode('Loading...')];

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
			node.children = [this.makeFailedToLoadNode()];
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

		const workloadChildren = await getChildrenOfWorkload('helm', name, namespace);

		if (!workloadChildren) {
			node.children = [this.makeFailedToLoadNode()];
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

