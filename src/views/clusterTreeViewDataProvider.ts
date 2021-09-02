import { MarkdownString, TreeItemCollapsibleState } from 'vscode';
import { KubectlCommands } from '../commands';
import { ClusterType, kubernetesTools } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './views';

export class ClusterTreeViewDataProvider extends TreeViewDataProvider {
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

	constructor(cluster: ClusterType, currentContext: string) {
		super({
			label: `${cluster.name} ${cluster.cluster.server}`,
		});

		this.name = cluster.name;

		const mdHover = new MarkdownString();
		mdHover.appendCodeblock(JSON.stringify(cluster, null, '  '), 'json');
		this.tooltip = mdHover;

		if (cluster.name === currentContext) {
			this.collapsibleState = TreeItemCollapsibleState.Collapsed;
		}

		this.command = {
			command: KubectlCommands.SetCurrentContext,
			arguments: [this.name],
			title: 'Set current context',
		};

		this.contextValue = TreeViewItemContext.Cluster;
	}
}
