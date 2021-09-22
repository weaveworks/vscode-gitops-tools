import { MarkdownString } from 'vscode';
import { HelmRelease } from '../kubernetes/helmRelease';
import { Kustomize } from '../kubernetes/kustomize';
import { createMarkdownTable } from '../utils/stringUtils';
import { TreeViewItem } from './treeNode';

/**
 * Base class for all Application tree view items.
 */
export class ApplicationTreeViewItem extends TreeViewItem {

	/**
	 * Creates markdwon string for Application tree view item tooltip.
	 * @param application Kustomize or HelmRelease application object.
	 * @param showJsonConfig Optional show Json config for dev debug.
	 * @returns Markdown string to use for Application tree view item tooltip.
	 */
	getMarkdown(application: Kustomize | HelmRelease,
		showJsonConfig: boolean = false): MarkdownString {

		const markdown: MarkdownString = createMarkdownTable(application);

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(application, null, '  '), 'json');
		}

		return markdown;
	}

}
