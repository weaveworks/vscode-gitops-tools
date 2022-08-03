import { OCIRepository } from '../../kubernetes/ociRepository';
import { KubernetesObjectKinds } from '../../kubernetes/kubernetesTypes';
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
		super(`${KubernetesObjectKinds.OCIRepository}: ${ociRepository.metadata?.name}`, ociRepository);

		this.resource = ociRepository;
	}

	get contexts() {
		return [KubernetesObjectKinds.HelmRepository];
	}
}
