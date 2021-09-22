import { EditorCommands } from '../commands';
import { FileTypes } from '../fileTypes';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { Bucket } from '../kubernetes/bucket';
import { SourceNode } from './sourceNode';
import { NodeLabels } from './nodeLabels';
import { NodeContext } from './nodeContext';
import { shortenRevision } from '../utils/stringUtils';

/**
 * Defines Bucket tree view item for display in GitOps Sources tree view.
 */
 export class BucketNode extends SourceNode {

	/**
	 * Bucket kubernetes resource object
	 */
	resource: Bucket;

	/**
	 * Creates new bucket tree view item for display.
	 * @param bucket Bucket kubernetes object info.
	 */
	constructor(bucket: Bucket) {
		super({
			label: `${NodeLabels.Bucket}: ${bucket.metadata?.name}`,
			description: shortenRevision(bucket.status.artifact?.revision),
		});

		// save git repository resource reference
		this.resource = bucket;

		// set context type value for bucket commands
		this.contextValue = NodeContext.Bucket;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(bucket);

		// set resource Uri to open bucket config document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			bucket.metadata?.namespace,
			`${ResourceTypes.Bucket}/${bucket.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}
}
