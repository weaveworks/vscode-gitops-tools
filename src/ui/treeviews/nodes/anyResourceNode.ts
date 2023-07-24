
import { KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { TreeNode } from './treeNode';

/**
 * Defines any kubernetes resourse.
 */
export class AnyResourceNode extends TreeNode {
	resource: KubernetesObject;

	constructor(anyResource: KubernetesObject) {
		super(anyResource.metadata?.name || '');

		this.description = anyResource.kind;

		// save metadata reference
		this.resource = anyResource;
	}

	get tooltip() {
		if(this.resource?.metadata?.namespace) {
			return `Namespace: ${this.resource.metadata.namespace}`;
		} else {
			return '';
		}
	}
}
