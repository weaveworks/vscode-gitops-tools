
import { FluxSourceObject } from 'types/flux/object';
import { shortenRevision } from 'utils/stringUtils';
import { ToolkitNode } from '../toolkitNode';
/**
 * Base class for all the Source tree view items.
 */
export class SourceNode extends ToolkitNode {
	resource!: FluxSourceObject;

	get revision() {
		return shortenRevision(this.resource.status.artifact?.revision);
	}

}
