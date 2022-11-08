import { HelmRepository } from '../../kubernetes/types/flux/helmRepository';
import { KubernetesObjectKinds } from '../../kubernetes/types/kubernetesTypes';
import { SourceNode } from './sourceNode';

/**
 * Defines HelmRepository tree view item for display in GitOps Sources tree view.
 */
export class HelmRepositoryNode extends SourceNode {

	/**
	 * Helm repository kubernetes resource object
	 */
	resource: HelmRepository;

	/**
	 * Creates new helm repository tree view item for display.
	 * @param helmRepository Helm repository kubernetes object info.
	 */
	constructor(helmRepository: HelmRepository) {
		super(`${KubernetesObjectKinds.HelmRepository}: ${helmRepository.metadata?.name}`, helmRepository);

		this.resource = helmRepository;
	}

	get contexts() {
		return [KubernetesObjectKinds.HelmRepository];
	}
}
