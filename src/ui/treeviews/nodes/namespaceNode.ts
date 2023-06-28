import { Kind, Namespace } from 'types/kubernetes/kubernetesTypes';
import { TreeNode } from './treeNode';

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
}
