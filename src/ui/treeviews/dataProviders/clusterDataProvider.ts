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
	private clusterNodes: ClusterNode[] = [];
	private loading = false;

	public getCurrentClusterNode(): ClusterNode | undefined {
		return this.clusterNodes.find(c => c.context.name === kubeConfig?.getCurrentContext());
	}


	public async refresh(treeItem?: TreeItem) {
		console.log('cluster refresh', treeItem);

		if (!treeItem) {
			this.clusterNodes = [];
			this.loadData();
		}
		this.redraw(treeItem);
	}

	public async redraw(treeItem?: TreeItem) {
		this._onDidChangeTreeData.fire(treeItem);
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


	private async getRootNodes(): Promise<TreeNode[]> {
		if (this.loading) {
			return [new TreeNode('Loading kubeconfig ...')];
		}
		return this.clusterNodes;
	}


	/**
	 * Check if the cluster node exists or not.
	 */
	public includesTreeNode(treeItem: TreeItem, clusterNodes: TreeNode[] = this.clusterNodes) {
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
	async loadData() {
		console.log('started cluster loadData');
		if(this.loading) {
			return;
		}

		await this.loadClusterNodes();
		this.loading = false;
	}

	async loadClusterNodes() {
		console.log('started loadClusterNodes');

		const t1 = Date.now();

		setVSCodeContext(ContextId.FailedToLoadClusterContexts, false);
		setVSCodeContext(ContextId.NoClusters, false);
		setVSCodeContext(ContextId.LoadingClusters, true);
		statusBar.startLoadingTree();
		this.clusterNodes = [];

		if (!kubeConfig) {
			setVSCodeContext(ContextId.NoClusters, false);
			setVSCodeContext(ContextId.FailedToLoadClusterContexts, true);
			setVSCodeContext(ContextId.LoadingClusters, false);
			statusBar.stopLoadingTree();
			return [];
		}


		const clusterNodes: ClusterNode[] = [];
		let currentContextTreeItem: ClusterNode | undefined;

		if (kubeConfig.getContexts().length === 0) {
			setVSCodeContext(ContextId.NoClusters, true);
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

		// Update async status of the deployments (flux commands take a while to run)
		currentContextTreeItem?.updateNodeContext();

		statusBar.stopLoadingTree();
		setVSCodeContext(ContextId.LoadingClusters, false);
		this.clusterNodes = clusterNodes;

		const t2 = Date.now();
		console.log('loadClusterNodes ∆', t2 - t1);
		// return clusterNodes;
		return;
	}

}
