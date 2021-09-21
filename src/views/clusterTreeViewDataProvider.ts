import {
	ExtensionContext,
	MarkdownString,
	ThemeColor,
	ThemeIcon
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
	async updateContextAndIcons(treeItems: ClusterTreeViewItem[]) {
		for (const treeItem of treeItems) {
			await treeItem.setContext();
			this.refresh(treeItem);
		}
	}
}

/**
 * Defines Cluster tree view item for displaying
 * configured kubernetes clusters in GitOps Clusters tree view.
 */
export class ClusterTreeViewItem extends TreeViewItem {
	/**
	 * Cluster name
	 */
	name: string;
	/**
	 * Whether or not flux is installed on this cluster
	 */
	isFlux: boolean = false;

	/**
	 * Creates new Cluster tree view item for display.
	 * @param cluster Cluster object info.
	 */
	constructor(cluster: Cluster) {
		super({
			label: cluster.name,
			description: cluster.cluster.server,
		});

		this.name = cluster.name;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(cluster);

		// set resource Uri to open cluster config in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			cluster.name,
			`${ResourceTypes.Namespace}/${cluster.name}`,
			FileTypes.Yaml);

		this.setIcon(new ThemeIcon('cloud'));

		// set current context command to change selected cluster
		this.command = {
			command: KubectlCommands.SetCurrentContext,
			arguments: [this.name],
			title: 'Set current context',
		};
	}

	/**
	 * Set context for active cluster (whether or not flux enabled)
	 */
	async setContext() {
		this.isFlux = (await kubernetesTools.isFluxInstalled(this.name)) || false;
		if (this.isFlux) {
			this.contextValue = TreeViewItemContext.ClusterFlux;
			this.setIcon(new ThemeIcon('pass-filled', new ThemeColor('terminal.ansiGreen')));
		} else {
			this.contextValue = TreeViewItemContext.Cluster;
		}
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
