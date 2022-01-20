import { window } from 'vscode';
import { ContextTypes, setVSCodeContext } from '../../vscodeContext';
import { failed } from '../../errorable';
import { fluxTools } from '../../flux/fluxTools';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { statusBar } from '../../statusBar';
import { ClusterContextNode } from '../nodes/clusterContextNode';
import { ClusterDeploymentNode } from '../nodes/clusterDeploymentNode';
import { refreshClustersTreeView, revealClusterNode } from '../treeViews';
import { DataProvider } from './dataProvider';

/**
 * Defines Clusters data provider for loading configured kubernetes clusters
 * and contexts in GitOps Clusters tree view.
 */
export class ClusterDataProvider extends DataProvider {

	/**
   * Creates Clusters tree view items from local kubernetes config.
   */
	async buildTree(): Promise<ClusterContextNode[]> {

		setVSCodeContext(ContextTypes.NoClusters, false);
		statusBar.startLoadingTree();
		setVSCodeContext(ContextTypes.LoadingClusters, true);

		// TODO: show error when it happens
		const contexts = await kubernetesTools.getContexts();

		if (!contexts) {
			setVSCodeContext(ContextTypes.NoClusters, true);
			return [];
		}

		const clusterNodes: ClusterContextNode[] = [];
		let currentContextTreeItem: ClusterContextNode | undefined;

		const currentContextResult = await kubernetesTools.getCurrentContext();
		let currentContext = '';
		if (failed(currentContextResult)) {
			window.showErrorMessage(`Failed to get current context: ${currentContextResult.error[0]}`);
		} else {
			currentContext = currentContextResult.result;
		}

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
		setVSCodeContext(ContextTypes.LoadingClusters, false);

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
}
