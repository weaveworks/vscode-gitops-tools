import { Bucket } from 'types/flux/bucket';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { SourceNode } from './sourceNode';

/**
 * Defines Bucket tree view item for display in GitOps Sources tree view.
 */
export class BucketNode extends SourceNode {
	/**
	 * Bucket kubernetes resource object
	 */
	resource!: Bucket;

	get contexts() {
		return [Kind.Bucket];
	}
}
