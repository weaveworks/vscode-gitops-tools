import { window } from 'vscode';
import { ContextTypes, setVSCodeContext } from '../../context';
import { fluxTools } from '../../flux/fluxTools';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { statusBar } from '../../statusBar';
import { ClusterDeploymentNode } from '../nodes/clusterDeploymentNode';
import { ClusterContextNode } from '../nodes/clusterContextNode';
import { refreshClustersTreeView, revealClusterNode } from '../treeViews';
import { DataProvider } from './dataProvider';

/**
 * Defines Clusters data provider for loading configured kubernetes clusters
 * and contexts in GitOps Clusters tree view.
 */
export class ClusterDataProvider extends DataProvider {

	/**
	 * Cache clusterNodes to acess them later.
	 */
	clusterNodes: ClusterContextNode[] = [];

	/**
	 * Whether or not the tree view finished building (not entirely, there's still async calls)
	 * and {@link clusterNodes} array was populated.
	 */
	isFinishedBuildingTree = false;

	/**
   * Creates Clusters tree view items from local kubernetes config.
   */
	async buildTree(): Promise<ClusterContextNode[]> {

		this.isFinishedBuildingTree = false;
		setVSCodeContext(ContextTypes.NoClusters, false);
		statusBar.startLoadingTree();
		setVSCodeContext(ContextTypes.LoadingClusters, true);

		const contexts = await kubernetesTools.getContexts();

		if (!contexts) {
			setVSCodeContext(ContextTypes.NoClusters, true);
			return [];
		}

		const clusterNodes: ClusterContextNode[] = [];
		let currentContextTreeItem: ClusterContextNode | undefined;
		const currentContext = (await kubernetesTools.getCurrentContext()) || '';
		for (const cluster of contexts) {
			const clusterNode = new ClusterContextNode(cluster);
			if (cluster.name === currentContext) {
				clusterNode.isCurrent = true;
				currentContextTreeItem = clusterNode;
				clusterNode.makeCollapsible();
				// load flux system deployments
				const fluxDeployments = await kubernetesTools.getFluxControllers();
				if (fluxDeployments) {
					clusterNode.expand();
					revealClusterNode(clusterNode, {
						expand: true,
					});
					for (const deployment of fluxDeployments.items) {
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
		this.isFinishedBuildingTree = true;
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
		const fluxCheckResult = await fluxTools.check();
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

	/**
	 * Return cluster node from the current kubernetes context.
	 */
	getCurrentClusterNode(): ClusterContextNode | undefined {
		if (!this.isFinishedBuildingTree) {
			window.showErrorMessage('Clusters are not yet loaded.');
			return;
		}

		for (const clusterNode of this.clusterNodes) {
			if (clusterNode.isCurrent) {
				return clusterNode;
			}
		}

		window.showErrorMessage('Current cluster was not found.');
		return undefined;
	}
}
