
import { FluxSourceObject } from 'types/flux/object';
import { NodeContext } from 'types/nodeContext';
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

	get contexts() {
		return this.resource.spec.suspend ? [NodeContext.Suspend] : [NodeContext.NotSuspend];
	}

}
