import {
  TreeItem,
  TreeItemCollapsibleState
} from 'vscode';

export class TreeViewItem extends TreeItem {
  parent: TreeViewItem | undefined;
  children: TreeViewItem[] = [];
  private commandString: string | undefined;

  constructor(label: string, tooltip: string, commandString: string, args: Array<any>) {
    super(label, TreeItemCollapsibleState.None);
    this.tooltip = tooltip;
    this.commandString = commandString;
    this.command = {
      command: this.commandString,
      arguments: args,
      title: tooltip
    };
  }

  makeCollapsible() {
    this.collapsibleState = TreeItemCollapsibleState.Collapsed;
  }

  expand() {
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  setIcon(icons: {light: string; dark: string}) {
    this.iconPath = icons;
  }

  addChild(item: TreeViewItem) {
    this.children.push(item);
    if (this.children.length) {
      if (this.collapsibleState !== TreeItemCollapsibleState.Expanded) {
        this.makeCollapsible();
      }
    }
    return this;
  }
}
