import { CommandId } from 'types/extensionIds';
import { FileTypes } from 'types/fileTypes';
import { KubernetesObject, qualifyToolkitKind } from 'types/kubernetes/kubernetesTypes';
import { getResourceUri } from 'utils/getResourceUri';
import { KnownTreeNodeResources, createMarkdownTable } from 'utils/markdownUtils';
import { SimpleDataProvider } from '../dataProviders/simpleDataProvider';
import { TreeNode } from './treeNode';



export class KubernetesObjectNode extends TreeNode {
	/**
	 * Kubernetes resource.
	 */
	resource: KubernetesObject;

	constructor(resource: KubernetesObject, label: string, dataProvider?: SimpleDataProvider) {
		super(label, dataProvider);

		this.resource = resource;
	}

	fullyQualifyKind(): string {
		return qualifyToolkitKind(this.resource.kind);
	}

	// @ts-ignore
	get tooltip(): string | MarkdownString {
		if (this.resource) {
			return createMarkdownTable(this.resource as KnownTreeNodeResources);
		}
	}

	// @ts-ignore
	get command(): Command | undefined {
		// Set click event handler to load kubernetes resource as yaml file in editor.
		if (this.resource) {
			let stringKind = this.fullyQualifyKind();
			const resourceUri = getResourceUri(
				this.resource.metadata.namespace,
				`${stringKind}/${this.resource.metadata.name}`,
				FileTypes.Yaml,
			);

			return {
				command: CommandId.EditorOpenResource,
				arguments: [resourceUri],
				title: 'View Resource',
			};
		}
	}

	findChildByResource(resource: KubernetesObject): KubernetesObjectNode | undefined {
		const found = this.children.find(child => {
			if (child instanceof KubernetesObjectNode) {
				return child.resource.metadata.name === resource.metadata.name &&
					child.resource.kind === resource.kind &&
					child.resource.metadata.namespace === resource.metadata.namespace;
			}
		});
		if (found) {
			return found as KubernetesObjectNode;
		}
	}

	get viewStateKey(): string {
		return this.resource.metadata.uid;
	}

	get contextType(): string | undefined {
		return this.resource.kind;
	}
}
