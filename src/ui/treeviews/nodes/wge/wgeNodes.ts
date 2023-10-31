
import { ToolkitObject } from 'types/flux/object';
import { NodeContext } from 'types/nodeContext';
import { themeIcon } from 'ui/icons';
import { SimpleDataProvider } from 'ui/treeviews/dataProviders/simpleDataProvider';
import { wgeDataProvider } from 'ui/treeviews/treeViews';
import { ToolkitNode } from '../toolkitNode';
import { TreeNode } from '../treeNode';

export class WgeNode extends ToolkitNode {
	dataProvider!: SimpleDataProvider;

	constructor(object: ToolkitObject) {
		super(object, wgeDataProvider);

		// this.label = `${object.kind}: ${object.metadata.name}.${object.metadata.namespace}`;
		this.label = `${object.metadata.name}`;
		this.makeCollapsible();
	}
}

export class WgeContainerNode extends TreeNode {
	constructor(label: any) {
		super(label, wgeDataProvider);
	}

	get contexts() {
		return [NodeContext.HasWgePortal, 'Container'];
	}

	get wgePortalQuery() {
		return '';
	}
}


export class TemplatesContainerNode extends WgeContainerNode {
	constructor() {
		super('Templates');

		this.setIcon(themeIcon('notebook-render-output'));
		this.makeCollapsible();
	}

	get wgePortalQuery() {
		return 'templates';
	}

	get viewStateKey() {
		return 'TemplatesContainer';
	}
}


export class CanariesContainerNode extends WgeContainerNode {
	constructor() {
		super('Canaries');

		this.setIcon(themeIcon('symbol-null'));
		this.makeCollapsible();
	}

	get wgePortalQuery() {
		return 'delivery';
	}

	get viewStateKey() {
		return 'CanariesContainer';
	}
}


export class PipelinesContainerNode extends WgeContainerNode {
	constructor() {
		super('Pipelines');

		this.setIcon(themeIcon('rocket'));
		this.makeCollapsible();
	}

	get wgePortalQuery() {
		return 'pipelines';
	}

	get viewStateKey() {
		return 'PipelinesContainer';
	}
}


export class GitOpsSetsContainerNode extends WgeContainerNode {
	constructor() {
		super('GitOpsSets');

		this.setIcon(themeIcon('outline-view-icon'));
		this.makeCollapsible();
	}

	get wgePortalQuery() {
		return 'gitopssets';
	}

	get viewStateKey() {
		return 'GitOpsSetsContainer';
	}
}
