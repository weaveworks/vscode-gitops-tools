import { Bucket } from '../../kubernetes/types/flux/bucket';
import { KubernetesObjectKinds } from '../../kubernetes/types/kubernetesTypes';
import { SourceNode } from './sourceNode';

/**
 * Defines Bucket tree view item for display in GitOps Sources tree view.
 */
export class BucketNode extends SourceNode {

	/**
	 * Bucket kubernetes resource object
	 */
	resource: Bucket;

	/**
	 * Creates new bucket tree view item for display.
	 * @param bucket Bucket kubernetes object info.
	 */
	constructor(bucket: Bucket) {
		super(`${KubernetesObjectKinds.Bucket}: ${bucket.metadata?.name}`, bucket);

		this.resource = bucket;
	}

	get contexts() {
		return [KubernetesObjectKinds.Bucket];
	}
}
