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
      treeItems.push(new TreeViewItem({
        label: `${cluster.name} ${cluster.cluster.server}`,
      }));
    }
    return treeItems;
  }
}
