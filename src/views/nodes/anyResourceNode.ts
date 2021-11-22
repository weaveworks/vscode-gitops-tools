import { KubernetesObject } from '@kubernetes/client-node';
import { TreeNode } from './treeNode';

/**
 * Defines any kubernetes resourse.
 */
export class AnyResourceNode extends TreeNode {

	/**
	 * kubernetes resource metadata
	 */
	resource: KubernetesObject;

	constructor(anyResource: KubernetesObject) {
		super(anyResource.metadata?.name || '');

		this.description = anyResource.kind;

		// save metadata reference
		this.resource = anyResource;
	}

	/**
	 * TODO: use optional chaining in the markdown hover function, so that NPE would be impossible
	 */
	get tooltip() {
		return '';
	}
}
