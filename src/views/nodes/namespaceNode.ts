import { KubernetesObjectKinds, Namespace } from '../../kubernetes/types/kubernetesTypes';
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

		this.description = KubernetesObjectKinds.Namespace;

		this.resource = namespace;
	}

	get contexts() {
		return [KubernetesObjectKinds.Namespace];
	}
}
