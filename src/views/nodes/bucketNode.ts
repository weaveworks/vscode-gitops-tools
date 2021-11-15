import { Bucket } from '../../kubernetes/bucket';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';
import { SourceNode } from './sourceNode';

/**
 * Defines Bucket tree view item for display in GitOps Sources tree view.
 */
export class BucketNode extends SourceNode {

	contextValue = NodeContext.Bucket;

	/**
	 * Bucket kubernetes resource object
	 */
	resource: Bucket;

	/**
	 * Creates new bucket tree view item for display.
	 * @param bucket Bucket kubernetes object info.
	 */
	constructor(bucket: Bucket) {
		super(`${NodeLabels.Bucket}: ${bucket.metadata?.name}`, bucket);

		this.resource = bucket;
	}
}
