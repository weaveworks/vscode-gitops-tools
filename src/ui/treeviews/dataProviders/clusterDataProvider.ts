import { fluxTools } from 'cli/flux/fluxTools';
import { getFluxControllers } from 'cli/kubernetes/kubectlGet';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { setVSCodeContext } from 'extension';
import { ContextId } from 'types/extensionIds';
import { statusBar } from 'ui/statusBar';
import { TreeItem } from 'vscode';
import { ClusterDeploymentNode } from '../nodes/cluster/clusterDeploymentNode';
import { ClusterNode } from '../nodes/cluster/clusterNode';
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
	private clusterNodes: ClusterNode[] = [];

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
	async buildTree(): Promise<ClusterNode[]> {
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
		process.nextTick(() => {});


		if (kubeConfig.getContexts().length === 0) {
			setVSCodeContext(ContextId.NoClusters, true);
			return [];
		}

		for (const context of kubeConfig.getContexts()) {
			const clusterNode = new ClusterNode(context);
			if (context.name === kubeConfig.getCurrentContext()) {
				clusterNode.isCurrent = true;
				currentContextTreeItem = clusterNode;
				clusterNode.makeCollapsible();
				// load flux system deployments
				const fluxControllers = await getFluxControllers();
				if (fluxControllers) {
					clusterNode.expand();
					revealClusterNode(clusterNode, {
						expand: true,
					});
					for (const deployment of fluxControllers) {
						clusterNode.addChild(new ClusterDeploymentNode(deployment));
					}
				}
			}
			clusterNodes.push(clusterNode);
		}

		// Update async status of the deployments (flux commands take a while to run)
		this.updateDeploymentStatus(currentContextTreeItem);
		// Update async cluster context/icons
		// this.updateClusterContexts(clusterNodes);

		statusBar.stopLoadingTree();
		setVSCodeContext(ContextId.LoadingClusters, false);
		this.clusterNodes = clusterNodes;

		return clusterNodes;
	}

	/**
	 * Update deployment status for flux controllers.
	 * Get status from running flux commands instead of kubectl.
	 */
	async updateDeploymentStatus(clusterNode?: ClusterNode) {
		if (!clusterNode || clusterNode.children.length === 0) {
			return;
		}
		const fluxCheckResult = await fluxTools.check(clusterNode.context.name);
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
	// TODO: FIXME: calling this is a bad idea with more than 10-100 contexts
	async updateClusterContexts(clusterNodes: ClusterNode[]) {
		await Promise.all(clusterNodes.map(async clusterNode => {
			await clusterNode.updateNodeContext();
			refreshClustersTreeView(clusterNode);
		}));
	}

	/**
	 * Update cluster context for a single cluster node.
	 * @param clusterNode Usually the selected clusterNode.
	 */
	async updateClusterContext(clusterNode: ClusterNode) {
		await clusterNode.updateNodeContext();
		refreshClustersTreeView(clusterNode);
	}
}
