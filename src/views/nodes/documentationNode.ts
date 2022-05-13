import { Uri } from 'vscode';
import { CommandId } from '../../commands';
import { asAbsolutePath } from '../../extensionContext';
import { DocumentationLink } from '../documentationConfig';
import { TreeNode } from './treeNode';

/**
 * Node for Documentation Tree View.
 */
export class DocumentationNode extends TreeNode {

	/**
	 * Url of the external web page with documentation.
	 */
	url: string;
	webview: boolean;
	title: string;

	constructor(link: DocumentationLink, isParent = false) {
		super(link.title);

		this.url = link.url;
		this.webview = link.webview || false;
		this.title = link.title;

		if (link.icon) {
			this.iconPath = asAbsolutePath(link.icon);
		}
	}

	get tooltip() {
		return this.url;
	}

	get command() {
		if(this.webview) {
			return {
				command: CommandId.OpenWebviewDocumentURI,
				arguments: [Uri.parse(this.url), this.title],
				title: 'Open document',
			}
		} else {
			return {
				command: CommandId.VSCodeOpen,
				arguments: [Uri.parse(this.url)],
				title: 'Open link',
			};
		}
	}
}
