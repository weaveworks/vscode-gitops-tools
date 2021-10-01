import { EditorCommands } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { Bucket } from '../../kubernetes/bucket';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ResourceTypes } from '../../kubernetes/kubernetesTypes';
import { shortenRevision } from '../../utils/stringUtils';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';
import { SourceNode } from './sourceNode';

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
		const resourceUri = kubernetesTools.getResourceUri(
			bucket.metadata?.namespace,
			`${ResourceTypes.Bucket}/${bucket.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [resourceUri],
			title: 'View Resource',
		};
	}
}
