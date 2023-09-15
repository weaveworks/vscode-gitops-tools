import { FluxWorkloadObject } from 'types/flux/object';
import { shortenRevision } from 'utils/stringUtils';
import { ToolkitNode } from '../source/toolkitNode';

/**
 * Base class for all Workload tree view items.
 */
export class WorkloadNode extends ToolkitNode {
	resource!: FluxWorkloadObject;

	get revision() {
		return shortenRevision(this.resource.status.lastAppliedRevision);
	}
}
