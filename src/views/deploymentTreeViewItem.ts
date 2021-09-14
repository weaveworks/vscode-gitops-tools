import { MarkdownString } from 'vscode';
import { HelmRelease } from '../kubernetes/helmRelease';
import { Kustomize } from '../kubernetes/kustomize';
import { createMarkdownTable } from '../utils/stringUtils';
import { TreeViewItem } from './treeViewItem';

/**
 * Base class for all Deployment tree view items.
 */
export class DeploymentTreeViewItem extends TreeViewItem {

	/**
	 * Creates markdwon string for Deployment tree view item tooltip.
	 * @param deployment Kustomize or HelmRelease deployment object.
	 * @param showJsonConfig Optional show Json config for dev debug.
	 * @returns Markdown string to use for Deployment tree view item tooltip.
	 */
	getMarkdown(deployment: Kustomize | HelmRelease,
		showJsonConfig: boolean = false): MarkdownString {

		const markdown: MarkdownString = createMarkdownTable(deployment);

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(deployment, null, '  '), 'json');
		}

		return markdown;
	}

}
