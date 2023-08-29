import { ContextId } from 'types/extensionIds';
import { documentationLinks } from '../documentationConfig';
import { DocumentationNode } from '../nodes/documentationNode';
import { DataProvider } from './dataProvider';
import { setVSCodeContext } from 'extension';

/**
 * Defines data provider for Documentation tree view.
 */
export class DocumentationDataProvider extends DataProvider {

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

		this.nodes = treeNodes;
	}
}
