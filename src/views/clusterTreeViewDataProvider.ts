import { getClusterProvider } from '../kubernetes-tools/getClusters';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';

export class ClusterTreeViewDataProvider extends TreeViewDataProvider {
  async buildTree() {
    const clusterProviderApi = await getClusterProvider();
    if (!clusterProviderApi) {
      return [];// TODO: show failure reason (if exists) as a single Tree View item
    }
    const treeItems: TreeViewItem[] = [];
    console.log(clusterProviderApi.list());
    for (const cluster of clusterProviderApi.list()) {
      treeItems.push(new TreeViewItem(cluster.displayName, '', '', []));// TODO: refactor this
    }
    return treeItems;
  }
}
