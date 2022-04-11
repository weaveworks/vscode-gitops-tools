import { TreeItem, window } from 'vscode';
import { failed } from '../../errorable';
import { fluxTools } from '../../flux/fluxTools';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { statusBar } from '../../statusBar';
import { ContextTypes, setVSCodeContext } from '../../vscodeContext';
import { ClusterContextNode } from '../nodes/clusterContextNode';
import { ClusterDeploymentNode } from '../nodes/clusterDeploymentNode';
import { TreeNode } from '../nodes/treeNode';
import { refreshClustersTreeView, revealClusterNode } from '../treeViews';
import { DataProvider } from './dataProvider';

/**
 * Defines Clusters data provider for loading configured kubernetes clusters
 * and contexts in GitOps Clusters tree view.
 */
export class ClusterDataProvider extends DataProvider {

	/**
	 * Keep a reference to all the nodes in the Clusters Tree View.
	 */
	private clusterNodes: ClusterContextNode[] = [];

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
	async buildTree(): Promise<ClusterContextNode[]> {

		setVSCodeContext(ContextTypes.FailedToLoadClusterContexts, false);
		setVSCodeContext(ContextTypes.NoClusters, false);
		setVSCodeContext(ContextTypes.LoadingClusters, true);
		statusBar.startLoadingTree();
		this.clusterNodes = [];

		const [contextsResult, currentContextResult] = await Promise.all([
			kubernetesTools.getContexts(),
			kubernetesTools.getCurrentContext(),
		]);

		if (failed(contextsResult)) {
			setVSCodeContext(ContextTypes.NoClusters, false);
			setVSCodeContext(ContextTypes.FailedToLoadClusterContexts, true);
			setVSCodeContext(ContextTypes.LoadingClusters, false);
			statusBar.stopLoadingTree();
			window.showErrorMessage(`Failed to get contexts: ${contextsResult.error[0]}`);
			return [];
		}

		const clusterNodes: ClusterContextNode[] = [];
		let currentContextTreeItem: ClusterContextNode | undefined;

		let currentContext = '';
		if (failed(currentContextResult)) {
			window.showErrorMessage(`Failed to get current context: ${currentContextResult.error[0]}`);
		} else {
			currentContext = currentContextResult.result;
		}

		if (contextsResult.result.length === 0) {
			setVSCodeContext(ContextTypes.NoClusters, true);
			return [];
		}

		for (const cluster of contextsResult.result) {
			const clusterNode = new ClusterContextNode(cluster);
			if (cluster.name === currentContext) {
				clusterNode.isCurrent = true;
				currentContextTreeItem = clusterNode;
				clusterNode.makeCollapsible();
				// load flux system deployments
				const fluxControllers = await kubernetesTools.getFluxControllers();
				if (fluxControllers) {
					clusterNode.expand();
					revealClusterNode(clusterNode, {
						expand: true,
					});
					for (const deployment of fluxControllers.items) {
						clusterNode.addChild(new ClusterDeploymentNode(deployment));
					}
				}
			}
			clusterNodes.push(clusterNode);
		}

		// Update async status of the deployments (flux commands take a while to run)
		this.updateDeploymentStatus(currentContextTreeItem);
		// Update async cluster context/icons
		this.updateClusterContexts(clusterNodes);

		statusBar.stopLoadingTree();
		setVSCodeContext(ContextTypes.LoadingClusters, false);
		this.clusterNodes = clusterNodes;

		return clusterNodes;
	}

	/**
	 * Update deployment status for flux controllers.
	 * Get status from running flux commands instead of kubectl.
	 */
	async updateDeploymentStatus(clusterNode?: ClusterContextNode) {
		if (!clusterNode) {
			return;
		}
		const fluxCheckResult = await fluxTools.check(clusterNode.contextName);
		if (!fluxCheckResult) {
			return;
		}

		// Match controllers fetched with flux with controllers
		// fetched with kubectl and update tree nodes.
		for (const clusterController of (clusterNode.children as ClusterDeploymentNode[])) {
			for (const controller of fluxCheckResult.controllers) {
				const clusterControllerName = clusterController.resource.metadata.name?.trim();
				const deploymentName = controller.name.trim();

				if (clusterControllerName === deploymentName) {
					clusterController.description = controller.status;
					if (controller.success) {
						clusterController.setStatus('success');
					} else {
						clusterController.setStatus('failure');
					}
				}
			}
			refreshClustersTreeView(clusterController);
		}
	}

	/**
	 * Update cluster context for all cluster nodes one by one.
	 * @param clusterNodes all cluster nodes in this tree view.
	 */
	async updateClusterContexts(clusterNodes: ClusterContextNode[]) {
		await Promise.all(clusterNodes.map(async clusterNode => {
			await clusterNode.updateNodeContext();
			refreshClustersTreeView(clusterNode);
		}));
	}
}
