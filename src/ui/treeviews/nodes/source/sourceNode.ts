
import { FluxSourceObject } from 'types/flux/object';
import { NodeContext } from 'types/nodeContext';
import { SimpleDataProvider } from 'ui/treeviews/dataProviders/simpleDataProvider';
import { sourceDataProvider } from 'ui/treeviews/treeViews';
import { shortenRevision } from 'utils/stringUtils';
import { ToolkitNode } from '../toolkitNode';
/**
 * Base class for all the Source tree view items.
 */
export class SourceNode extends ToolkitNode {
	resource!: FluxSourceObject;
	dataProvider!: SimpleDataProvider;


	constructor(resource: FluxSourceObject) {
		super(resource, sourceDataProvider);
	}

	get revision() {
		return shortenRevision(this.resource.status.artifact?.revision);
	}

	get contexts() {
		return this.resource.spec.suspend ? [NodeContext.Suspend] : [NodeContext.NotSuspend];
	}


}
