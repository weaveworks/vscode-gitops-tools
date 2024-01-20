import { getHelmReleases, getKustomizations } from 'cli/kubernetes/kubectlGet';
import { getNamespaces } from 'cli/kubernetes/kubectlGetNamespace';
import { ContextData } from 'data/contextData';
import { statusBar } from 'ui/statusBar';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { groupNodesByNamespace } from 'utils/treeNodeUtils';
import { makeTreeNode } from '../nodes/makeTreeNode';
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

		const nodes: WorkloadNode[] = [];

		const [kustomizations, helmReleases, _] = await Promise.all([
			// Fetch all workloads
			getKustomizations(),
			getHelmReleases(),
			// Cache namespaces to group the nodes
			getNamespaces(),
		]);

		for (const k of sortByMetadataName(kustomizations)) {
			nodes.push(makeTreeNode(k, this) as KustomizationNode);
		}

		for (const hr of sortByMetadataName(helmReleases)) {
			nodes.push(makeTreeNode(hr, this) as HelmReleaseNode);
		}

		for (const node of nodes) {
			node.updateChildren();
		}

		statusBar.stopLoadingTree();

		const [groupedNodes] = await groupNodesByNamespace(nodes, false, true);
		return groupedNodes;
	}

}

