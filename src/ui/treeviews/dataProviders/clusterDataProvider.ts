import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { setVSCodeContext } from 'extension';
import { ContextId } from 'types/extensionIds';
import { statusBar } from 'ui/statusBar';
import { TreeItem } from 'vscode';
import { ClusterNode } from '../nodes/cluster/clusterNode';
import { TreeNode } from '../nodes/treeNode';
import { DataProvider } from './dataProvider';

/**
 * Defines Clusters data provider for loading configured kubernetes clusters
 * and contexts in GitOps Clusters tree view.
 */
export class ClusterDataProvider extends DataProvider {
	protected nodes: ClusterNode[] = [];

	public getCurrentClusterNode(): ClusterNode | undefined {
		return this.nodes.find(c => c.context.name === kubeConfig?.getCurrentContext());
	}

	public redrawCurrentNode() {
		this.redraw(this.getCurrentClusterNode());
	}


	public async getChildren(element?: TreeItem): Promise<TreeItem[]> {
		if(!element) {
			return this.getRootNodes();
		} else if (element instanceof TreeNode) {
			return element.children;
		}

		return [];
	}


	/**
	 * Check if the cluster node exists or not.
	 */
	public includesTreeNode(treeItem: TreeItem, clusterNodes: TreeNode[] = this.nodes) {
		for (const clusterNode of clusterNodes) {
			if (treeItem === clusterNode) {
				return true;
			}
			const includesInNested = this.includesTreeNode(treeItem, clusterNode.children);
			if (includesInNested) {
				return true;
			}
		}
		return false;
	}


	/**
   * Creates Clusters tree view items from local kubernetes config.
   */
	async loadRootNodes() {
		console.log('+ started loadClusterNodes');

		const t1 = Date.now();


		statusBar.startLoadingTree();

		let currentContextTreeItem: ClusterNode | undefined;

		if (kubeConfig.getContexts().length === 0) {
			return;
		}

		for (const context of kubeConfig.getContexts()) {
			const clusterNode = new ClusterNode(context);
			if (context.name === kubeConfig.getCurrentContext()) {
				currentContextTreeItem = clusterNode;
				clusterNode.makeCollapsible();
			}
			this.nodes.push(clusterNode);
		}

		// Update async status of the deployments (flux commands take a while to run)
		currentContextTreeItem?.updateNodeContext();

		statusBar.stopLoadingTree();

		const t2 = Date.now();
		console.log('+ loadClusterNodes ∆', t2 - t1);
	}
}
