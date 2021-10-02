import { ThemeIcon, TreeItemCollapsibleState, Uri } from 'vscode';
import { ViewCommands } from '../../commands';
import { DocumentationLinks } from '../documentationConfig';
import { Link } from '../link';
import { TreeNode } from '../nodes/treeNode';
import { DataProvider } from './dataProvider';

/**
 * Defines data provider for Documentation tree view.
 */
export class DocumentationDataProvider extends DataProvider {

	/**
	 * Creates documentation tree view from documenation links config.
	 * @returns Documentation tree view items to display.
	 */
	buildTree(): Promise<TreeNode[]> {
		const treeNodes: TreeNode[] = [];

		for (const link of DocumentationLinks) {
			let treeNode = this.createLinkNode(link, false);
			treeNode.collapsibleState = TreeItemCollapsibleState.Expanded;
			treeNodes.push(treeNode);

			// add doc section links
			for (const childLink of link.links || []) {
				let childNode: TreeNode = this.createLinkNode(childLink);
				treeNode.addChild(childNode);
			}
		}

		return Promise.resolve(treeNodes);
	}

	/**
   * Creates link tree view item.
   * @param link Link config with title and link url.
   * @param showLinkIcon Optionally set link node icon.
   * @returns Link tree view item.
   */
	private createLinkNode(link: Link, showLinkIcon = true): TreeNode {
		let linkNode = new TreeNode(link.title);
		linkNode.tooltip = link.url;

		linkNode.command = {
			command: ViewCommands.Open,
			arguments: [Uri.parse(link.url)],
			title: 'Open link',
		};

		if (showLinkIcon) {
			linkNode.setIcon(new ThemeIcon('link-external'));
		}

		return linkNode;
	}
}
