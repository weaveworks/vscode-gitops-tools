import { Environment } from 'types/flux/pipeline';
import { wgeDateProvider } from 'ui/treeviews/treeViews';
import { TreeNode } from '../treeNode';

export class PipelineEnvironmentNode extends TreeNode {
	environment: Environment;

	constructor(environment: Environment) {
		super(environment.name, wgeDateProvider);

		this.makeCollapsible();
		this.environment = environment;

		this.description = environment.targets.map(t => t.namespace).join(', ');
	}
}
