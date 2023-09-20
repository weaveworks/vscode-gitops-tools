import { FluxWorkloadObject } from 'types/flux/object';
import { ToolkitNode } from '../source/toolkitNode';

/**
 * Base class for all Workload tree view items.
 */
export class WorkloadNode extends ToolkitNode {
	resource!: FluxWorkloadObject;

}
