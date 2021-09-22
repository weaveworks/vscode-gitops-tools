import {
  MarkdownString,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
  Uri
} from 'vscode';

/**
 * Defines tree view item base class used by all GitOps tree views.
 */
export class TreeNode extends TreeItem {
  parent: TreeNode | undefined;
  children: TreeNode[] = [];

	/**
	 * Creates new tree view item.
	 * TODO: change params back to typed params this class had originally.
	 * @param options Tree view item options.
	 */
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

	/**
	 * Collapses tree node and hides its children.
	 */
  makeCollapsible() {
    this.collapsibleState = TreeItemCollapsibleState.Collapsed;
  }

	/**
	 * Expands a tree node and shows its children.
	 */
  expand() {
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

	/**
	 * Sets tree view item icon.
	 * @param icon Theme icon, uri or light/dark svg icon path.
	 */
  setIcon(icon: ThemeIcon | Uri | {light: string; dark: string}) {
    this.iconPath = icon;
  }

	/**
	 * Add new tree view item to the children collection.
	 * @param child Child tree view item to add.
	 * @returns Updated tree view itme with added child.
	 */
  addChild(child: TreeNode) {
    this.children.push(child);
    if (this.children.length) {
			// update collapse/expand state
      if (this.collapsibleState !== TreeItemCollapsibleState.Expanded) {
        this.makeCollapsible();
      }
    }
    return this;
  }
}
