import { OCIRepository } from 'types/flux/ociRepository';
import { SourceNode } from './sourceNode';

/**
 * Defines OCIRepository tree view item for display in GitOps Sources tree view.
 */
export class OCIRepositoryNode extends SourceNode {
	resource!: OCIRepository;

	/**
	 * Creates new oci repository tree view item for display.
	 * @param ociRepository OCI repository kubernetes object info.
	 */
	constructor(ociRepository: OCIRepository) {
		super(ociRepository);
	}

}
