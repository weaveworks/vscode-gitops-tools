
import { NodeContext } from 'types/nodeContext';
import { themeIcon } from 'ui/icons';
import { SimpleDataProvider } from 'ui/treeviews/dataProviders/simpleDataProvider';
import { wgeDateProvider } from 'ui/treeviews/treeViews';
import { ToolkitNode } from '../toolkitNode';
import { TreeNode } from '../treeNode';

export class WgeNode extends ToolkitNode {
	dataProvider!: SimpleDataProvider;

	constructor(object: any) {
		super(object, wgeDateProvider);
		this.makeCollapsible();
	}
}

export class WgeContainerNode extends TreeNode {
	constructor(object: any) {
		super(object, wgeDateProvider);
	}

	get contexts() {
		return [NodeContext.HasWgePortal];
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
}
