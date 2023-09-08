import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { statusBar } from 'ui/statusBar';
import { ClusterNode } from '../nodes/cluster/clusterNode';
import { SimpleDataProvider } from './simpleDataProvider';

/**
 * Defines Clusters data provider for loading configured kubernetes clusters
 * and contexts in GitOps Clusters tree view.
 */
export class ClusterDataProvider extends SimpleDataProvider {

	public getCurrentClusterNode(): ClusterNode | undefined {
		const nodes = this.nodes as ClusterNode[];
		return nodes.find(c => c.context.name === kubeConfig?.getCurrentContext());
	}

	public redrawCurrentNode() {
		this.redraw(this.getCurrentClusterNode());
	}


	/**
   * Creates Clusters tree view items from local kubernetes config.
   */
	async loadRootNodes() {
		statusBar.startLoadingTree();
		const clusterNodes: ClusterNode[] = [];

		let currentContextTreeItem: ClusterNode | undefined;

		if (kubeConfig.getContexts().length === 0) {
			statusBar.stopLoadingTree();
			return [];
		}

		for (const context of kubeConfig.getContexts()) {
			const clusterNode = new ClusterNode(context);
			if (context.name === kubeConfig.getCurrentContext()) {
				currentContextTreeItem = clusterNode;
				clusterNode.makeCollapsible();
			}
			clusterNodes.push(clusterNode);
		}

		statusBar.stopLoadingTree();

		return clusterNodes;
	}

	public updateCurrentContextChildNodes() {
		const currentContextTreeItem = this.getCurrentClusterNode();
		currentContextTreeItem?.updateNodeChildren();
	}

	public currentContextIsGitOpsNotEnabled() {
		const node = this.getCurrentClusterNode();
		// undefined is not false
		if(node && typeof node.isGitOpsEnabled === 'boolean') {
			return !node.isGitOpsEnabled;
		}
		return false;
	}
}
