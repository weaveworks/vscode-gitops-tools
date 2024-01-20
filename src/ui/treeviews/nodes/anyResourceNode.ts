
import { KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { SimpleDataProvider } from '../dataProviders/simpleDataProvider';
import { KubernetesObjectNode } from './kubernetesObjectNode';

/**
 * Defines any kubernetes resourse.
 */
export class AnyResourceNode extends KubernetesObjectNode {
	constructor(anyResource: KubernetesObject, dataProvider: SimpleDataProvider) {
		super(anyResource, anyResource.metadata.name || '', dataProvider);

		this.description = anyResource.kind;
	}

	get tooltip() {
		if(this.resource.metadata.namespace) {
			return `Namespace: ${this.resource.metadata.namespace}`;
		} else {
			return '';
		}
	}
}
