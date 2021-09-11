import {
	ExtensionContext,
	ExtensionMode,
	MarkdownString,
	TreeItemCollapsibleState
} from 'vscode';
import { KubectlCommands } from '../commands';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { Cluster } from '../kubernetes/kubernetesConfig';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './treeViewItemContext';

let _extensionContext: ExtensionContext;

/**
 * Defines Clusters data provider for loading configured kubernetes clusters
 * and contexts in GitOps Clusters tree view.
 */
export class ClusterTreeViewDataProvider extends TreeViewDataProvider {
	constructor(extensionContext: ExtensionContext) {
		super();
		_extensionContext = extensionContext;
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

		this.contextValue = TreeViewItemContext.Cluster;
		this.name = cluster.name;
		this.tooltip = this.getMarkdown(cluster); //, _extensionContext.extensionMode === ExtensionMode.Development);
		this.command = {
			command: KubectlCommands.SetCurrentContext,
			arguments: [this.name],
			title: 'Set current context',
		};

		if (cluster.name === currentContext) {
			// why do we want to collapse a cluster tree node that matches kubectl current context ???
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
		markdown.appendMarkdown(`--- | ---\n`);
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
