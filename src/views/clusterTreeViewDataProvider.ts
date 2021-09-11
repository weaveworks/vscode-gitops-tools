import {
	ExtensionContext,
	ExtensionMode,
	MarkdownString,
	TreeItemCollapsibleState
} from 'vscode';
import { KubectlCommands } from '../commands';
import { Cluster } from '../kubernetes/kubernetesConfig';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './views';

let _extensionContext: ExtensionContext;

export class ClusterTreeViewDataProvider extends TreeViewDataProvider {
	constructor(extensionContext: ExtensionContext) {
		super();
		_extensionContext = extensionContext;
	}

  async buildTree() {
    const clusters = await kubernetesTools.getClusters();
    if (!clusters) {
      return [];
    }
    const treeItems: TreeViewItem[] = [];
		const currentContext = (await kubernetesTools.getCurrentContext()) || '';
    for (const cluster of clusters) {
      treeItems.push(new ClusterTreeViewItem(cluster, currentContext));
    }
    return treeItems;
  }
}

export class ClusterTreeViewItem extends TreeViewItem {
	name: string;

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
