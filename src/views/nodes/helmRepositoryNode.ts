import { EditorCommands } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ResourceTypes } from '../../kubernetes/kubernetesTypes';
import { HelmRepository } from '../../kubernetes/helmRepository';
import { SourceNode } from './sourceNode';
import { NodeLabels } from './nodeLabels';
import { NodeContext } from './nodeContext';
import { shortenRevision } from '../../utils/stringUtils';

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
		super({
			label: `${NodeLabels.HelmRepositry}: ${helmRepository.metadata?.name}`,
			description: shortenRevision(helmRepository.status.artifact?.revision),
		});

		// save helm repository resource reference
		this.resource = helmRepository;

		// set context type value for helm repository commands
		this.contextValue = NodeContext.HelmRepository;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(helmRepository);

		// set resource Uri to open helm repository config document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			helmRepository.metadata?.namespace,
			`${ResourceTypes.HelmRepository}/${helmRepository.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}
}
