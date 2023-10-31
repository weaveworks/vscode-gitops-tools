import { KubeConfigState, kubeConfigState } from 'cli/kubernetes/kubernetesConfig';
import { InfoLabel, infoNodes } from 'utils/makeTreeviewInfoNode';
import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { TreeNode } from '../nodes/treeNode';


/**`
 * Defines tree view data provider base class for all GitOps tree views.
 */
export class SimpleDataProvider implements TreeDataProvider<TreeItem> {
	private _nodes: TreeNode[] = [];

	guid = '';

	constructor() {
		this.guid = Math.random().toString(36);
	}

	get nodes() {
		return this._nodes;
	}

	protected loading = false;

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
		if (this.loading || kubeConfigState === KubeConfigState.Loading) {
			return infoNodes(InfoLabel.Loading, this);
		}
		if(this.nodes.length === 0) {
			return infoNodes(InfoLabel.NoResources, this);
		}

		return this.nodes;
	}


	public async reload() {
		if(this.loading) {
			return;
		}

		this.loading = true;
		this._nodes = [];
		this._nodes = await this.loadRootNodes();
		this.loading = false;

		this.redraw();
	}

	async loadRootNodes(): Promise<TreeNode[]> {
		return [];
	}

}


