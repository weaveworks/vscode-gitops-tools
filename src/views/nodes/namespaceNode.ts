import { MarkdownString } from 'vscode';
import { CommandId } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { Namespace } from '../../kubernetes/kubernetesTypes';
import { createMarkdownTable } from '../../utils/stringUtils';
import { TreeNode } from './treeNode';

/**
 * Defines any kubernetes resourse.
 */
export class NamespaceNode extends TreeNode {

	/**
	 * kubernetes resource metadata
	 */
	resource: Namespace;

	constructor(namespace: Namespace) {
		super(namespace.metadata?.name || '');
		// this.description = KubernetesObjectKinds.Namespace;

		// save metadata reference
		this.resource = namespace;

		this.tooltip = this.getMarkdown(this.resource);

		// set resource Uri to open resource config document in editor
		const resourceUri = kubernetesTools.getResourceUri(
			namespace.metadata?.namespace,
			`${namespace.kind}/${namespace.metadata?.name}`,
			FileTypes.Yaml,
		);

		// set open resource in editor command
		this.command = {
			command: CommandId.EditorOpenResource,
			arguments: [resourceUri],
			title: 'View Resource',
		};
	}

	getMarkdown(resource: Namespace): MarkdownString {
		return createMarkdownTable(resource);
	}
}
