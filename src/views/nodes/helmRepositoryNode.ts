import { EditorCommands } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { HelmRepository } from '../../kubernetes/helmRepository';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ResourceTypes } from '../../kubernetes/kubernetesTypes';
import { shortenRevision } from '../../utils/stringUtils';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';
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
		super(`${NodeLabels.HelmRepositry}: ${helmRepository.metadata?.name}`);

		this.description = shortenRevision(helmRepository.status.artifact?.revision);

		// save helm repository resource reference
		this.resource = helmRepository;

		// set context type value for helm repository commands
		this.contextValue = NodeContext.HelmRepository;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(helmRepository);

		// set resource Uri to open helm repository config document in editor
		const resourceUri = kubernetesTools.getResourceUri(
			helmRepository.metadata?.namespace,
			`${ResourceTypes.HelmRepository}/${helmRepository.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [resourceUri],
			title: 'View Resource',
		};
	}
}
