import { Pipeline } from 'types/flux/pipeline';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { ToolkitNode } from '../toolkitNode';

export class PipelineNode extends ToolkitNode {
	resource!: Pipeline;

	constructor(pipeline: Pipeline) {
		super(pipeline);

		this.makeCollapsible();
	}

	// get revision() {
	// 	// return shortenRevision(this.resource.status.lastAppliedRevision);
	// 	return `${this.resource.status.phase} ${this.resource.status.lastAppliedSpec || ''}`;
	// }

	get contexts() {
		const contextsArr: string[] = [Kind.Pipeline];
		return contextsArr;
	}
}
