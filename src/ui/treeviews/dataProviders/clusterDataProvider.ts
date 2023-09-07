import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
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
   * Creates Clusters tree view items from local kubernetes config.
   */
	async loadRootNodes() {
		statusBar.startLoadingTree();

		let currentContextTreeItem: ClusterNode | undefined;

		if (kubeConfig.getContexts().length === 0) {
			statusBar.stopLoadingTree();
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

		statusBar.stopLoadingTree();
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
