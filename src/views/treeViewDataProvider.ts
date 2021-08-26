import {
  Event,
  EventEmitter,
  TreeDataProvider,
  TreeItem
} from 'vscode';
import {TreeViewItem} from './treeViewItem';

export class TreeViewDataProvider implements TreeDataProvider<TreeItem> {
  private treeItems: TreeItem[] | null = null;
  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined> = new EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

  public refresh(treeItem?: TreeItem) {
    this.treeItems = null;
    this._onDidChangeTreeData.fire(treeItem);
  }

  public getTreeItem(element: TreeItem): TreeItem {
    return element;
  }

  public getParent(element: TreeItem): TreeItem | null {
    if (element instanceof TreeViewItem && element.parent) {
      return element.parent;
    }
    return null;
  }

  public async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (!this.treeItems) {
      this.treeItems = await this.buildTree();
    }

    if (element instanceof TreeViewItem) {
      return element.children;
    }

    if (!element) {
      if (this.treeItems) {
        return this.treeItems;
      }
    }
    return [];
  }

  buildTree(): Promise<TreeViewItem[]> {
    return Promise.resolve([]);
  }
}
