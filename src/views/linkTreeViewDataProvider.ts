import {Uri} from 'vscode';
import {BuiltInCommands} from '../commands';
import {TreeViewItem} from './treeViewItem';
import {TreeViewDataProvider} from './treeViewDataProvider';
import {DocumentationLinks} from './documentationConfig';
import * as path from 'path';

export class LinkTreeViewDataProvider extends TreeViewDataProvider {

  buildTree(): Promise<TreeViewItem[]> {
    const treeItems: Array<TreeViewItem> = [];
    DocumentationLinks.forEach(link => {
      let args: Array<any> = [];
      args.push(Uri.parse(link.url));
      let treeItem = new TreeViewItem(link.title, link.url, BuiltInCommands.Open, args);
      treeItem.setIcon({
        light: path.join(__filename, '..', '..', 'resources', 'icons', 'light', `link-external.svg`),
        dark: path.join(__filename, '..', '..', 'resources', 'icons', 'dark', `link-external.svg`)
      });
      treeItems.push(treeItem);
    });

    return Promise.resolve(treeItems);
  }
}
