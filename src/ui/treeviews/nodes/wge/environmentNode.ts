import { Environment } from 'types/flux/pipeline';
import { WgeNode } from './wgeNodes';

export class PipelineEnvironmentNode extends WgeNode {
	resource!: Environment;
}
