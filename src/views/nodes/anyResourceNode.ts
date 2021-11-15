import { KubernetesObject } from '@kubernetes/client-node';
import { CommandId } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { TreeNode } from './treeNode';

/**
 * Defines any kubernetes resourse.
 */
export class AnyResourceNode extends TreeNode {

	/**
	 * kubernetes resource metadata
	 */
	resource: KubernetesObject;

	constructor(anyResource: KubernetesObject) {
		super(anyResource.metadata?.name || '');

		this.description = anyResource.kind;

		// save metadata reference
		this.resource = anyResource;

		// set resource Uri to open resource config document in editor
		const resourceUri = kubernetesTools.getResourceUri(
			anyResource.metadata?.namespace,
			`${anyResource.kind}/${anyResource.metadata?.name}`,
			FileTypes.Yaml,
		);

		// set open resource in editor command
		this.command = {
			command: CommandId.EditorOpenResource,
			arguments: [resourceUri],
			title: 'View Resource',
		};
	}
}
