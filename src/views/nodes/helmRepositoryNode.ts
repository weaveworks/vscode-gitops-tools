import { HelmRepository } from '../../kubernetes/helmRepository';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';
import { SourceNode } from './sourceNode';

/**
 * Defines HelmRepository tree view item for display in GitOps Sources tree view.
 */
export class HelmRepositoryNode extends SourceNode {

	contextValue = NodeContext.HelmRepository;

	/**
	 * Helm repository kubernetes resource object
	 */
	resource: HelmRepository;

	/**
	 * Creates new helm repository tree view item for display.
	 * @param helmRepository Helm repository kubernetes object info.
	 */
	constructor(helmRepository: HelmRepository) {
		super(`${NodeLabels.HelmRepositry}: ${helmRepository.metadata?.name}`, helmRepository);

		this.resource = helmRepository;
	}
}
