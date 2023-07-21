import { Kind, Namespace } from 'types/kubernetes/kubernetesTypes';
import { TreeNode } from './treeNode';
import { TreeItemCollapsibleState } from 'vscode';

/**
 * Defines any kubernetes resourse.
 */
export class NamespaceNode extends TreeNode {

	/**
	 * kubernetes resource metadata
	 */
	resource: Namespace;

	constructor(namespace: Namespace) {
		super(namespace.metadata?.name || '');

		this.description = Kind.Namespace;

		this.resource = namespace;
	}

	get contexts() {
		return [Kind.Namespace];
	}

	updateLabel() {
		if(this.collapsibleState === TreeItemCollapsibleState.Collapsed) {
			this.label = `${this.resource.metadata?.name} (${this.children.length})`;
		} else {
			this.label = `${this.resource.metadata?.name}`;
		}
	}
}
