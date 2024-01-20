import { KubernetesObject } from '@kubernetes/client-node';
import { Command, MarkdownString, ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { CommandId } from '../../commands';
import { asAbsolutePath } from '../../extensionContext';
import { FileTypes } from '../../fileTypes';
import { KubernetesContextWithCluster } from '../../kubernetes/types/kubernetesConfig';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { createMarkdownTable, KnownTreeNodeResources } from '../../utils/markdownUtils';
import { GitOpsTemplate } from '../../kubernetes/types/flux/gitOpsTemplate';

export const enum TreeNodeIcon {
	Error = 'error',
	Warning = 'warning',
	Success = 'success',
	Unknown = 'unknown',
}

/**
 * Defines tree view item base class used by all GitOps tree views.
 */
export class TreeNode extends TreeItem {

	/**
	 * Kubernetes resource.
	 */
	resource?: Exclude<KnownTreeNodeResources, KubernetesContextWithCluster> | GitOpsTemplate | KubernetesObject;

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
	 * Sets tree view item icon.
	 *
	 * When passing a string - pick an item from a
	 * relative file path `resouces/icons/(dark|light)/${icon}.svg`
	 * @param icon Theme icon, uri or light/dark svg icon path.
	 */
	setIcon(icon: string | ThemeIcon | Uri | TreeNodeIcon) {
		if (icon === TreeNodeIcon.Error) {
			this.iconPath = new ThemeIcon('error', new ThemeColor('editorError.foreground'));
		} else if (icon === TreeNodeIcon.Warning) {
			this.iconPath = new ThemeIcon('warning', new ThemeColor('editorWarning.foreground'));
		} else if (icon === TreeNodeIcon.Success) {
			this.iconPath = new ThemeIcon('pass', new ThemeColor('terminal.ansiGreen'));
		} else if (icon === TreeNodeIcon.Unknown) {
			this.iconPath = new ThemeIcon('circle-large-outline');
		} else if (typeof icon === 'string') {
			this.iconPath = {
				light: asAbsolutePath(`resources/icons/light/${icon}.svg`),
				dark: asAbsolutePath(`resources/icons/dark/${icon}.svg`),
			};
		} else {
			this.iconPath = icon;
		}
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
			const resourceUri = kubernetesTools.getResourceUri(
				this.resource.metadata?.namespace,
				`${this.resource.kind}/${this.resource.metadata?.name}`,
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
		if (this.contexts.length) {
			return this.joinContexts(this.contexts);
		}
	}
}
