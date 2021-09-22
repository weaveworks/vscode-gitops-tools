import {
  ThemeIcon,
  TreeItemCollapsibleState,
  Uri
} from 'vscode';
import { ViewCommands } from '../commands';
import { DocumentationLinks } from './documentationConfig';
import { Link } from './link';
import { DataProvider } from './dataProvider';
import { TreeNode } from './treeNode';

export class DocumentationDataProvider extends DataProvider {

  /**
   * Creates documentation tree view from documenation links config.
   * @returns Documentation tree view items to display.
   */
  buildTree(): Promise<TreeNode[]> {
    const treeNodes: Array<TreeNode> = [];
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
    let args: Array<Uri> = [];
    args.push(Uri.parse(link.url));
    let linkNode = new TreeNode({
      label: link.title,
      tooltip: link.url,
      commandString: ViewCommands.Open,
      args
    });
    if (showLinkIcon) {
      linkNode.setIcon(new ThemeIcon('link-external'));
    }
    return linkNode;
  }
}
