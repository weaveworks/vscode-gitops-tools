import { OCIRepository } from 'types/flux/ociRepository';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { NodeContext } from 'types/nodeContext';
import { SourceNode } from './sourceNode';

/**
 * Defines OCIRepository tree view item for display in GitOps Sources tree view.
 */
export class OCIRepositoryNode extends SourceNode {

	/**
	 * OCI repository kubernetes resource object
	 */
	resource: OCIRepository;

	/**
	 * Creates new oci repository tree view item for display.
	 * @param ociRepository OCI repository kubernetes object info.
	 */
	constructor(ociRepository: OCIRepository) {
		super(`${Kind.OCIRepository}: ${ociRepository.metadata?.name}`, ociRepository);

		this.resource = ociRepository;
	}

	get contexts() {
		const contextsArr: string[] = [Kind.OCIRepository];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
