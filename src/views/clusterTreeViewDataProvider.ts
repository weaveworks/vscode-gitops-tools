import { clusterProvider } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';

export class ClusterTreeViewDataProvider extends TreeViewDataProvider {
  async buildTree() {
    const clusterProviderApi = await clusterProvider();
    if (!clusterProviderApi) {
      return [];// TODO: show failure reason (if exists) as a single Tree View item
    }
    const treeItems: TreeViewItem[] = [];
    for (const cluster of clusterProviderApi.list()) {
      treeItems.push(new TreeViewItem({
        label: cluster.displayName
      }));
    }
    return treeItems;
  }
}
