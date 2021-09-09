import {
  MarkdownString,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
  Uri
} from 'vscode';

export class TreeViewItem extends TreeItem {
  parent: TreeViewItem | undefined;
  children: TreeViewItem[] = [];

  constructor({
    label,
		description,
    tooltip,
    commandString,
    args,
  }: {
    label: string;
		description?: string;
    tooltip?: string | MarkdownString;
    commandString?: string;
    args?: Array<unknown>;
  }) {
    super(label, TreeItemCollapsibleState.None);
    this.tooltip = tooltip;
		this.description = description;
    if (commandString) {
      this.command = {
        command: commandString,
        arguments: args,
        title: typeof tooltip === 'string' ? tooltip : ''
      };
    }
  }

  makeCollapsible() {
    this.collapsibleState = TreeItemCollapsibleState.Collapsed;
  }

  expand() {
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  setIcon(icon: ThemeIcon | Uri | {light: string; dark: string}) {
    this.iconPath = icon;
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
