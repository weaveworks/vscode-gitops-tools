import { Namespace } from '../../kubernetes/kubernetesTypes';
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
		// this.description = KubernetesObjectKinds.Namespace;

		this.resource = namespace;
	}
}
