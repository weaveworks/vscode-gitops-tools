import { FluxWorkloadObject } from 'types/flux/object';
import { NodeContext } from 'types/nodeContext';
import { ToolkitNode } from '../toolkitNode';

/**
 * Base class for all Workload tree view items.
 */
export class WorkloadNode extends ToolkitNode {
	resource!: FluxWorkloadObject;

	get contexts() {
		return this.resource.spec.suspend ? [NodeContext.Suspend] : [NodeContext.NotSuspend];
	}
}
