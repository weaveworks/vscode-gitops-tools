import { KubeConfigState, kubeConfig, kubeConfigState } from 'cli/kubernetes/kubernetesConfig';
import { InfoNode, infoNodes } from 'utils/makeTreeviewInfoNode';
import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { TreeNode } from '../nodes/treeNode';


/**`
 * Defines tree view data provider base class for all GitOps tree views.
 */
export class DataProvider implements TreeDataProvider<TreeItem> {
	protected nodes: TreeNode[] = [];
	protected collapsibleStates = new Map<string, TreeItemCollapsibleState>();

	protected loading = false;
	protected loadingContext = '';

	protected _onDidChangeTreeData: EventEmitter<TreeItem | undefined> = new EventEmitter<TreeItem | undefined>();
	readonly onDidChangeTreeData: Event<TreeItem | undefined> = this._onDidChangeTreeData.event;


	/* if treeItem is undefined, redraw all tree items */
	public redraw(treeItem?: TreeItem) {
		this._onDidChangeTreeData.fire(treeItem);
	}

	/**
	 * Gets tree view item for the specified tree element.
	 * @param element Tree element.
	 * @returns Tree view item.
	 */
	public getTreeItem(element: TreeItem): TreeItem {
		return element;
	}

	/**
	 * Gets tree element parent.
	 * @param element Tree item to get parent for.
	 * @returns Parent tree item or null for the top level nodes.
	 */
	public getParent(element: TreeItem): TreeItem | null {
		if (element instanceof TreeNode && element.parent) {
			return element.parent;
		}
		return null;
	}

	// this is called by vscode treeview redraw to get the nodes to display
	public async getChildren(element?: TreeItem): Promise<TreeItem[]> {
		if(!element) {
			return this.getRootNodes();
		} else if (element instanceof TreeNode) {
			return element.children;
		}

		return [];
	}

	// give nodes for vscode to render based on async data loading state
	protected async getRootNodes(): Promise<TreeNode[]> {
		if (this.isLoadingCurrentContext() || kubeConfigState === KubeConfigState.Loading) {
			return infoNodes(InfoNode.Loading);
		}
		if(this.nodes.length === 0) {
			return infoNodes(InfoNode.NoResources);
		}

		return this.nodes;
	}

	isLoadingCurrentContext() {
		return this.loading && this.loadingContext === kubeConfig.currentContext;
	}

	public async reload() {
		if(this.isLoadingCurrentContext()) {
			return;
		}

		this.loadingContext = kubeConfig.currentContext;
		const contextNameClosure = kubeConfig.currentContext;

		console.log(`start loading ${kubeConfig.currentContext} ${this.constructor.name}`);

		this.loading = true;
		this.saveCollapsibleStates();
		this.nodes = [];
		await this.loadRootNodes();
		this.loadCollapsibleStates();
		this.loading = false;
		console.log(`finish loading ${kubeConfig.currentContext} ${this.constructor.name}`);

		this.redraw();
	}

	async loadRootNodes() {
		this.nodes = [];
	}

	saveCollapsibleStates() {
		this.collapsibleStates.clear();

		for(const node of this.nodes) {
			const name = node.resource?.metadata?.name;
			if(name) {
				this.collapsibleStates.set(name, node.collapsibleState || TreeItemCollapsibleState.Collapsed);
			}
		}
	}

	loadCollapsibleStates() {
		for(const node of this.nodes) {
			const name = node.resource?.metadata?.name;
			if(name) {
				const state = this.collapsibleStates.get(name);
				if(state) {
					node.collapsibleState = state;
				}
			}
		}
	}



}


