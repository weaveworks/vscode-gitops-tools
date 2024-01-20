import { env } from 'vscode';
import { SourceNode } from '../views/nodes/sourceNode';
import { WorkloadNode } from '../views/nodes/workloadNode';

/**
 * Copy to clipboard any resource node name.
 */
export function copyResourceName(resourceNode: SourceNode | WorkloadNode) {
	const name = resourceNode.resource.metadata.name;

	if (!name) {
		return;
	}

	env.clipboard.writeText(name);
}
