import { documentationLinks } from '../documentationConfig';
import { DocumentationNode } from '../nodes/documentationNode';
import { SimpleDataProvider } from './simpleDataProvider';

/**
 * Defines data provider for Documentation tree view.
 */
export class DocumentationDataProvider extends SimpleDataProvider {

	protected async getRootNodes() {
		return this.nodes;
	}

	/**
	 * Creates documentation tree view from documenation links config.
	 */
	async loadRootNodes() {
		const treeNodes: DocumentationNode[] = [];

		for (const link of documentationLinks) {
			const treeNode = new DocumentationNode(link, true);

			for (const childLink of link.links || []) {
				treeNode.addChild(new DocumentationNode(childLink, false));
			}

			treeNodes.push(treeNode);
		}

		return treeNodes;
	}
}
