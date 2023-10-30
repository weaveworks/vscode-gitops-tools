import { ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';

import { CommonIcon, commonIcon } from 'ui/icons';
import { asAbsolutePath } from 'utils/asAbsolutePath';
import { SimpleDataProvider } from '../dataProviders/simpleDataProvider';

/**
 * Defines tree view item base class used by all GitOps tree views.
 */
export class TreeNode extends TreeItem {
	resource?: any;

	/**
	 * Reference to the parent node (if exists).
	 */
	parent: TreeNode | undefined;

	/**
	 * Reference to all the child nodes.
	 */
	children: TreeNode[] = [];


	dataProvider?: SimpleDataProvider;

	/*
	 * async load children for the node
	 */
	async updateChildren() {
		// no-op
	}

	/**
	 * Creates new tree node.
	 * @param label Tree node label
	 */
	constructor(label: string, dataProvider?: SimpleDataProvider) {
		super(label, TreeItemCollapsibleState.None);
		this.dataProvider = dataProvider;
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
	 * Update icon and other status properties.
	 */
	updateStatus(): void {}

	redraw() {
		if(this.dataProvider) {
			this.dataProvider.redraw(this);
		}
	}

	/**
	 * Sets tree view item icon.
	 *
	 * When passing a string - pick an item from a
	 * relative file path `resouces/icons/(dark|light)/${icon}.svg`
	 * @param icon Theme icon, uri or light/dark svg icon path.
	 */
	setIcon(icon: string | ThemeIcon | Uri |undefined) {
		if (typeof icon === 'string') {
			this.iconPath = {
				light: asAbsolutePath(`resources/icons/light/${icon}.svg`),
				dark: asAbsolutePath(`resources/icons/dark/${icon}.svg`),
			};
		} else {
			this.iconPath = icon;
		}
	}

	setCommonIcon(icon: CommonIcon) {
		this.iconPath = commonIcon(icon);
	}


	/**
	 * Add new tree view item to the children collection.
	 * @param child Child tree view item to add.
	 * @returns Updated tree view itme with added child.
	 */
	addChild(child: TreeNode) {
		this.children.push(child);
		child.parent = this;
		if (this.children.length) {
			// update collapse/expand state
			if (this.collapsibleState !== TreeItemCollapsibleState.Expanded) {
				this.makeCollapsible();
			}
		}
		return this;
	}

	removeChild(child: TreeNode) {
		this.children = this.children.filter(c => c !== child);
	}


	/**
	 *
	 * VSCode doesn't support multiple contexts on the Tree Nodes, only string.
	 *
	 * Transform array to string:
	 *
	 * ```ts
	 * joinContexts('', 'one', 'two') // 'one;two;'
	 * ```
	 *
	 * @param contexts contexts for the tree node
	 */
	joinContexts(contexts: string[]): string {
		return contexts.filter(context => context.length)
			.map(context => `${context};`)
			.join('');
	}

	/**
	 * VSCode contexts to use for setting {@link contextValue}
	 * of this tree node. Used for context/inline menus.
	 *
	 * Contexts are used to enable/disable menu items.
	 */
	get contexts(): string[] {
		return [];
	}

	/**
	 *
	 * Contexts for types of resources.
	 */
	get contextsKind(): string[] {
		return [];
	}

	// @ts-ignore
	get contextValue() {
		const cs = [...this.contexts, ...this.contextsKind];
		if(cs.length) {
			return this.joinContexts(cs);
		}
	}

	// @ts-ignore
	get tooltip(): string | MarkdownString {
		return '';
	}

	// @ts-ignore
	get command(): Command | undefined {}


	get viewStateKey(): string {
		return '';
	}
}



