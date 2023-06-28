import { Uri } from 'vscode';

import { CommandId } from 'types/extensionIds';
import { asAbsolutePath } from 'utils/asAbsolutePath';
import { DocumentationLink } from '../documentationConfig';
import { TreeNode } from './treeNode';

/**
 * Node for Documentation Tree View.
 */
export class DocumentationNode extends TreeNode {

	/**
	 * Url of the external web page with documentation.
	 */
	url?: string;
	title: string;
	newUserGuide?: boolean;

	constructor(link: DocumentationLink, isParent = false) {
		super(link.title);

		this.title = link.title;
		this.newUserGuide = link.newUserGuide;

		if(link.url) {
			this.url = link.url;
		}

		if (link.icon) {
			this.iconPath = asAbsolutePath(link.icon);
		}
	}

	get tooltip() {
		return this.url || this.title;
	}

	get command() {
		if(this.url) {
			return {
				command: CommandId.VSCodeOpen,
				arguments: [Uri.parse(this.url)],
				title: 'Open link',
			};
		} else if(this.newUserGuide) {
			return {
				command: CommandId.ShowNewUserGuide,
				title: 'Open link',
			};
		}
	}
}
