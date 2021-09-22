import { ExtensionContext } from 'vscode';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { DataProvider } from './dataProvider';
import { ClusterNode } from '../clusterNode';
import { ClusterDeploymentNode } from '../clusterDeploymentNode';
import { statusBar } from '../../statusBar';

/**
 * Defines Clusters data provider for loading configured kubernetes clusters
 * and contexts in GitOps Clusters tree view.
 */
export class ClusterDataProvider extends DataProvider {
	constructor(private extensionContext: ExtensionContext) {
		super();
	}

	/**
   * Creates Clusters tree view items from local kubernetes config.
   * @returns Cluster tree view items to display.
   */
  async buildTree(): Promise<ClusterNode[]> {
		// load configured kubernetes clusters
    const clusters = await kubernetesTools.getClusters();
    if (!clusters) {
      return [];
    }
    const treeItems: ClusterNode[] = [];
		const currentContext = (await kubernetesTools.getCurrentContext()) || '';
    for (const cluster of clusters) {
			const clusterNode = new ClusterNode(cluster);
			if (cluster.name === currentContext) {
				clusterNode.makeCollapsible();
				// load flux system deployments
				const fluxDeployments = await kubernetesTools.getFluxDeployments();
				if (fluxDeployments) {
					clusterNode.expand();
					for (const deployment of fluxDeployments.items) {
						clusterNode.addChild(new ClusterDeploymentNode(deployment));
					}
				}
			}
			treeItems.push(clusterNode);
    }

		// Do not wait for context and icons (can take a few seconds)
		this.updateContextAndIcons(treeItems);

		statusBar.hide();
    return treeItems;
  }

	/**
	 * Update vscode context and tree view icons
	 * after tree view items become visible.
	 * @param treeItems All cluster tree items.
	 */
	async updateContextAndIcons(treeItems: ClusterNode[]) {
		for (const treeItem of treeItems) {
			await treeItem.setContext();
			this.refresh(treeItem);
		}
	}
}
