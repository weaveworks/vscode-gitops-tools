import { fluxTools } from 'cli/flux/fluxTools';
import { getChildrenOfWorkload, getHelmReleases, getKustomizations } from 'cli/kubernetes/kubectlGet';
import { getNamespaces } from 'cli/kubernetes/kubectlGetNamespace';
import { setVSCodeContext } from 'extension';
import { ContextId } from 'types/extensionIds';
import { Namespace } from 'types/kubernetes/kubernetesTypes';
import { statusBar } from 'ui/statusBar';
import { addFluxTreeToNode, groupNodesByNamespace } from 'utils/treeNodeUtils';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { AnyResourceNode } from '../nodes/anyResourceNode';
import { NamespaceNode } from '../nodes/namespaceNode';
import { TreeNode } from '../nodes/treeNode';
import { HelmReleaseNode } from '../nodes/workload/helmReleaseNode';
import { KustomizationNode } from '../nodes/workload/kustomizationNode';
import { WorkloadNode } from '../nodes/workload/workloadNode';
import { refreshWorkloadsTreeView } from '../treeViews';
import { DataProvider } from './dataProvider';
import { KubernetesObjectDataProvider } from './kubernetesObjectDataProvider';

/**
 * Defines data provider for loading Kustomizations
 * and Helm Releases in Workloads Tree View.
 */
export class WorkloadDataProvider extends KubernetesObjectDataProvider {
	/**
   * Creates Workload tree nodes for the currently selected kubernetes cluster.
   * @returns Workload tree nodes to display.
   */
	async buildTree(): Promise<NamespaceNode[]> {
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

		const [groupedNodes] = await groupNodesByNamespace(workloadNodes);
		return groupedNodes;
	}

	/**
	 * Fetch all kubernetes resources that were created by a kustomize/helmRelease
	 * and add them as child nodes of the workload.
	 * @param workloadNode target workload node
	 */
	async updateWorkloadChildren(workloadNode: WorkloadNode) {
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

		if (!resourceTree || !resourceTree.resources) {
			node.children = [new TreeNode('No Resources')];
			refreshWorkloadsTreeView(node);
			return;
		}

		addFluxTreeToNode(node, resourceTree.resources);
		refreshWorkloadsTreeView(node);
	}


	async updateHelmReleaseChildren(node: HelmReleaseNode) {
		const name = node.resource.metadata?.name || '';
		const namespace = node.resource.metadata?.namespace || '';

		// const targetNamespace = node.resource.spec.targetNamespace;
		const workloadChildren = await getChildrenOfWorkload('helm', name, namespace);


		if (!workloadChildren || workloadChildren.length === 0) {
			node.children = [new TreeNode('No Resources')];
			refreshWorkloadsTreeView(node);
			return;
		}

		const childrenNodes = workloadChildren.map(child => new AnyResourceNode(child));
		const [groupedNodes, clusterScopedNodes] = await groupNodesByNamespace(childrenNodes);
		node.children = [...groupedNodes, ...clusterScopedNodes];

		refreshWorkloadsTreeView(node);
	}

	/**
	 * This is called when the tree node is being expanded.
	 * @param workloadNode target node or undefined when at the root level.
	 */
	async getChildren(workloadNode?: KustomizationNode | HelmReleaseNode) {
		if (workloadNode) {
			if (workloadNode.children.length) {
				return workloadNode.children;
			} else {
				return [new TreeNode('Loading...')];
			}
		} else {
			this.treeItems = await this.buildTree();
			return this.treeItems;
		}
	}
}
