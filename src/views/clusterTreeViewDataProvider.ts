import {
	ExtensionContext,
	MarkdownString
} from 'vscode';
import { KubectlCommands } from '../commands';
import { FileTypes } from '../fileTypes';
import { Cluster } from '../kubernetes/kubernetesConfig';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './treeViewItemContext';
import { ClusterDeploymentTreeViewItem } from './clusterDeploymentTreeViewItem';
import { statusBar } from '../statusBar';
import { createMarkdownTable } from '../utils/stringUtils';


/**
 * Defines Clusters data provider for loading configured kubernetes clusters
 * and contexts in GitOps Clusters tree view.
 */
export class ClusterTreeViewDataProvider extends TreeViewDataProvider {
	constructor(private extensionContext: ExtensionContext) {
		super();
	}

	/**
   * Creates Clusters tree view items from local kubernetes config.
   * @returns Cluster tree view items to display.
   */
  async buildTree(): Promise<ClusterTreeViewItem[]> {
		// load configured kubernetes clusters
    const clusters = await kubernetesTools.getClusters();
    if (!clusters) {
      return [];
    }
    const treeItems: ClusterTreeViewItem[] = [];
		const currentContext = (await kubernetesTools.getCurrentContext()) || '';
    for (const cluster of clusters) {
			const clusterTreeViewItem = new ClusterTreeViewItem(cluster);
			if (cluster.name === currentContext) {
				clusterTreeViewItem.makeCollapsible();
				// load flux system deployments
				const fluxDeployments = await kubernetesTools.getFluxDeployments();
				if (fluxDeployments) {
					clusterTreeViewItem.expand();
					for (const deployment of fluxDeployments.items) {
						clusterTreeViewItem.addChild(new ClusterDeploymentTreeViewItem(deployment));
					}
				}
			}
			treeItems.push(clusterTreeViewItem);
    }
		statusBar.hide();
    return treeItems;
  }
}

/**
 * Defines Cluster tree view item for displaying
 * configured kubernetes clusters in GitOps Clusters tree view.
 */
export class ClusterTreeViewItem extends TreeViewItem {
	name: string;

	/**
	 * Creates new Cluster tree view item for display.
	 * @param cluster Cluster object info.
	 */
	constructor(cluster: Cluster) {
		super({
			label: cluster.name,
			description: cluster.cluster.server,
		});

		// set context type value for cluster commands
		this.contextValue = TreeViewItemContext.Cluster;
		this.name = cluster.name;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(cluster);

		// set current context command to change selected cluster
		this.command = {
			command: KubectlCommands.SetCurrentContext,
			arguments: [this.name],
			title: 'Set current context',
		};
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 * @param cluster Cluster info object.
	 * @param showJsonConfig Optional show Json config flag for dev debug.
	 * @returns Markdown string to use for Cluster tree view item tooltip.
	 */
	getMarkdown(cluster: Cluster,	showJsonConfig: boolean = false): MarkdownString {

		const markdown: MarkdownString = createMarkdownTable(cluster);

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(cluster, null, '  '), 'json');
		}

		return markdown;
	}

}
