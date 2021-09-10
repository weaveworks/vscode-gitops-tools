import { ExtensionContext, ExtensionMode, TreeItemCollapsibleState } from 'vscode';
import { KubectlCommands } from '../commands';
import { ClusterType } from '../kubernetes/kubernetesConfig';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { generateClusterHover } from './treeViewItemHover';
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

	constructor(cluster: ClusterType, currentContext: string) {
		super({
			label: `${cluster.name} ${cluster.cluster.server}`,
		});

		this.name = cluster.name;

		this.tooltip = generateClusterHover(cluster, _extensionContext.extensionMode === ExtensionMode.Development);

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
