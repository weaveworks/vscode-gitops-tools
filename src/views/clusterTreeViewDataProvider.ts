import { MarkdownString, TreeItemCollapsibleState } from 'vscode';
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

class ClusterTreeViewItem extends TreeViewItem {
	constructor(cluster: ClusterType, currentContext: string) {
		super({
			label: `${cluster.name} ${cluster.cluster.server}`,
		});

		const mdHover = new MarkdownString();
		mdHover.appendCodeblock(JSON.stringify(cluster, null, '  '), 'json');
		this.tooltip = mdHover;

		if (cluster.name === currentContext) {
			this.collapsibleState = TreeItemCollapsibleState.Collapsed;
		}

		this.contextValue = TreeViewItemContext.Cluster;
	}
}
