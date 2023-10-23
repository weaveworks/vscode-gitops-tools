import { Command, MarkdownString, ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';

import { CommandId } from 'types/extensionIds';
import { FileTypes } from 'types/fileTypes';
import { KubernetesObject, qualifyToolkitKind } from 'types/kubernetes/kubernetesTypes';
import { CommonIcon, commonIcon } from 'ui/icons';
import { asAbsolutePath } from 'utils/asAbsolutePath';
import { getResourceUri } from 'utils/getResourceUri';
import { KnownTreeNodeResources, createMarkdownTable } from 'utils/markdownUtils';

/**
 * Defines tree view item base class used by all GitOps tree views.
 */
export class TreeNode extends TreeItem {

	/**
	 * Kubernetes resource.
	 */
	resource?: KubernetesObject;

	/**
	 * Reference to the parent node (if exists).
	 */
	parent: TreeNode | undefined;

	/**
	 * Reference to all the child nodes.
	 */
	children: TreeNode[] = [];

	/**
	 * Creates new tree node.
	 * @param label Tree node label
	 */
	constructor(label: string) {
		super(label, TreeItemCollapsibleState.None);
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

	findChildByResource(resource: KubernetesObject): TreeNode | undefined {
		return this.children.find(child => {
			if (child.resource) {
				return child.resource.metadata?.name === resource.metadata?.name &&
					child.resource.kind === resource.kind &&
					child.resource.metadata?.namespace === resource.metadata?.namespace;
			}
		});
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

	fullyQualifyKind(): string {
		return qualifyToolkitKind(this.resource?.kind || '');
	}

	// @ts-ignore
	get tooltip(): string | MarkdownString {
		if (this.resource) {
			return createMarkdownTable(this.resource as KnownTreeNodeResources);
		}
	}

	// @ts-ignore
	get command(): Command | undefined {
		// Set click event handler to load kubernetes resource as yaml file in editor.
		if (this.resource) {
			let stringKind = this.fullyQualifyKind();
			const resourceUri = getResourceUri(
				this.resource.metadata?.namespace,
				`${stringKind}/${this.resource.metadata?.name}`,
				FileTypes.Yaml,
			);

			return {
				command: CommandId.EditorOpenResource,
				arguments: [resourceUri],
				title: 'View Resource',
			};
		}
	}

	/**
	 * VSCode contexts to use for setting {@link contextValue}
	 * of this tree node. Used for context/inline menus.
	 */
	get contexts(): string[] {
		return [];
	}

	// @ts-ignore
	get contextValue() {
		const cs = this.contexts;
		if(this.resource?.kind) {
			cs.push(this.resource.kind);
		}
		if(cs.length) {
			return this.joinContexts(cs);
		}
	}
}
