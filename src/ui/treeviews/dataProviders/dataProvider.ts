import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { TreeNode } from '../nodes/treeNode';

/**
 * Defines tree view data provider base class for all GitOps tree views.
 */
export class DataProvider implements TreeDataProvider<TreeItem> {
	protected nodes: TreeNode[] = [];
	protected loading = false;

	protected _onDidChangeTreeData: EventEmitter<TreeItem | undefined> = new EventEmitter<TreeItem | undefined>();
	readonly onDidChangeTreeData: Event<TreeItem | undefined> = this._onDidChangeTreeData.event;


	public async refresh(treeItem?: TreeItem) {
		const allStr = treeItem ? 'ALL' : treeItem;
		console.log(`## ${this.constructor.name} refresh`, allStr);

		if (!treeItem) {
			this.reloadData();
		}
		this.redraw(treeItem);
	}

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

	public async getChildren(element?: TreeItem): Promise<TreeItem[]> {
		if(!element) {
			return this.getRootNodes();
		} else if (element instanceof TreeNode) {
			return element.children;
		}

		return [];
	}


	protected async getRootNodes(): Promise<TreeNode[]> {
		if (this.loading) {
			return [];
		}
		return this.nodes;
	}

	async reloadData() {
		const t1 = Date.now();

		console.log(`# started ${this.constructor.name} reloadData`);
		if(this.loading) {
			return;
		}

		this.nodes = [];
		this.loading = true;
		await this.loadRootNodes();
		this.loading = false;
		this.redraw();

		const t2 = Date.now();
		console.log(`# finished ${this.constructor.name} reloadData ∆`, t2 - t1);
	}

	async loadRootNodes() {
		this.nodes = [];
	}




	// /**
	//  * Creates initial tree view items collection.
	//  * @returns
	//  */
	// buildTree(): Promise<TreeNode[]> {
	// 	return Promise.resolve([]);
	// }

}
