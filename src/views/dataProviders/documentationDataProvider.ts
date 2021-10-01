import { ThemeIcon, TreeItemCollapsibleState, Uri } from 'vscode';
import { ViewCommands } from '../../commands';
import { DocumentationLinks } from '../documentationConfig';
import { Link } from '../link';
import { TreeNode } from '../nodes/treeNode';
import { DataProvider } from './dataProvider';

export class DocumentationDataProvider extends DataProvider {

	/**
	 * Creates documentation tree view from documenation links config.
	 * @returns Documentation tree view items to display.
	 */
	buildTree(): Promise<TreeNode[]> {
		const treeNodes: TreeNode[] = [];
		DocumentationLinks.forEach(link => {
			let treeNode = this.createLinkNode(link, false); // no icon
			treeNode.collapsibleState = TreeItemCollapsibleState.Expanded;
			treeNodes.push(treeNode);
			// add doc section links
			link.links?.forEach(childLink => {
				let childNode: TreeNode = this.createLinkNode(childLink);
				childNode.parent = treeNode;
				treeNode.addChild(childNode);
			});
		});
		return Promise.resolve(treeNodes);
	}

	/**
   * Creates link tree view item.
   * @param link Link config with title and link url.
   * @param showLinkIcon Optionally set link node icon.
   * @returns Link tree view item.
   */
	private createLinkNode(link: Link, showLinkIcon = true): TreeNode {
		let args: Uri[] = [];
		args.push(Uri.parse(link.url));
		let linkNode = new TreeNode(link.title);
		linkNode.tooltip = link.url;
		linkNode.command = {
			command: ViewCommands.Open,
			arguments: args,
			title: 'Open link',
		};
		if (showLinkIcon) {
			linkNode.setIcon(new ThemeIcon('link-external'));
		}
		return linkNode;
	}
}
