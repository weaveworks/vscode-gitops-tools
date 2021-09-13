import {
	ExtensionContext,
	MarkdownString,
	TreeItemCollapsibleState
} from 'vscode';
import { FileTypes } from '../fileTypes';
import { KubectlCommands } from '../commands';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { Cluster } from '../kubernetes/kubernetesConfig';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './treeViewItemContext';
import { statusBar } from '../statusBar';

let _extensionContext: ExtensionContext;

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
      treeItems.push(new ClusterTreeViewItem(cluster, currentContext));
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
	 * @param currentContext Current kubernetes cluster context name.
	 */
	constructor(cluster: Cluster, currentContext: string) {
		super({
			label: `${cluster.name} ${cluster.cluster.server}`,
		});

		// set context type value for cluster commands
		this.contextValue = TreeViewItemContext.Cluster;
		this.name = cluster.name;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(cluster);

		// set resource Uri to open cluster config in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			cluster.name,
			`${ResourceTypes.Namespace}/${cluster.name}`,
			FileTypes.Yaml);

		// set current context command to change selected cluster
		this.command = {
			command: KubectlCommands.SetCurrentContext,
			arguments: [this.name],
			title: 'Set current context',
		};

		if (cluster.name === currentContext) {
			// TODO: why do we want to collapse a cluster tree node that matches kubectl current context ???
			this.collapsibleState = TreeItemCollapsibleState.Collapsed;
		}
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 * @param cluster Cluster info object.
	 * @param showJsonConfig Optional show Json config flag for dev debug.
	 * @returns Markdown string to use for Cluster tree view item tooltip.
	 */
	getMarkdown(cluster: Cluster,	showJsonConfig: boolean = false): MarkdownString {
		const markdown: MarkdownString = new MarkdownString();
		markdown.appendMarkdown(`Property | Value\n`);
		markdown.appendMarkdown(`:--- | :---\n`);
		markdown.appendMarkdown(`Name | ${cluster.name}\n`);
		markdown.appendMarkdown(`Server | ${cluster.cluster.server}\n`);

		if (cluster.cluster['certificate-authority']) {
			markdown.appendMarkdown(`Certificate authority | ${cluster.cluster['certificate-authority']}`);
		}

		if (cluster.cluster['certificate-authority-data']) {
			markdown.appendMarkdown(`Certificate authority data | ${cluster.cluster['certificate-authority-data']}`);
		}

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(cluster, null, '  '), 'json');
		}

		return markdown;
	}

}
