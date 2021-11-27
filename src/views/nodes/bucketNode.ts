import { Bucket } from '../../kubernetes/bucket';
import { KubernetesObjectKinds } from '../../kubernetes/kubernetesTypes';
import { SourceNode } from './sourceNode';

/**
 * Defines Bucket tree view item for display in GitOps Sources tree view.
 */
export class BucketNode extends SourceNode {

	contextValue = KubernetesObjectKinds.Bucket;

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
}
