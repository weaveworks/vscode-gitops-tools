import { MarkdownString } from 'vscode';
import { kubectlCluster } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';

export class ClusterTreeViewDataProvider extends TreeViewDataProvider {
  async buildTree() {
    const clusters = await kubectlCluster();
    if (!clusters) {
      return [];
    }
    const treeItems: TreeViewItem[] = [];
    for (const cluster of clusters) {
			const mdHover = new MarkdownString();
			mdHover.appendCodeblock(JSON.stringify(cluster, null, '  '), 'json');
      treeItems.push(new TreeViewItem({
        label: `${cluster.name} ${cluster.cluster.server}`,
				tooltip: mdHover,
      }));
    }
    return treeItems;
  }
}
