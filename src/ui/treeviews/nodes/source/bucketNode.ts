import { Bucket } from 'types/flux/bucket';
import { SourceNode } from './sourceNode';

/**
 * Defines Bucket tree view item for display in GitOps Sources tree view.
 */
export class BucketNode extends SourceNode {
	/**
	 * Bucket kubernetes resource object
	 */
	resource!: Bucket;
}
