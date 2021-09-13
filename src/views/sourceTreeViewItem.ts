import { MarkdownString } from 'vscode';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRepository } from '../kubernetes/helmRepository';
import { generateMarkdownTableHeader, generateMarkdownTableRow } from '../utils/markdownStringUtils';
import { TreeViewItem } from './treeViewItem';

/**
 * Base class for all the Source tree view items.
 */
 export class SourceTreeViewItem extends TreeViewItem {

	// TODO: refactor this to pluck object properties we want to include in markdown tooltips
	// and handle it genericallly for all tree view items in new ./utils/stringUtils.ts helper module
	/**
	 * Creates markdwon string for Source tree view item tooltip.
	 * @param source GitRepository, HelmRepository or Bucket kubernetes object.
	 * @param showJsonConfig Optional show Json config flag for dev debug.
	 * @returns Markdown string to use for Source tree view item tooltip.
	 */
	 getMarkdown(source: GitRepository | HelmRepository | Bucket,
		showJsonConfig: boolean = false): MarkdownString {

		const markdown: MarkdownString = new MarkdownString();
		generateMarkdownTableHeader(markdown);
		generateMarkdownTableRow('Api version', source.apiVersion, markdown);
		generateMarkdownTableRow('Kind', source.kind, markdown);
		generateMarkdownTableRow('Name', source.metadata.name, markdown);
		generateMarkdownTableRow('Namespace', source.metadata.namespace, markdown);
		generateMarkdownTableRow('Interval', source.spec.interval, markdown);
		generateMarkdownTableRow('Timeout', source.spec.timeout, markdown);

		if (source.kind === 'GitRepository') {
			generateMarkdownTableRow('URL', source.spec.url, markdown);
			generateMarkdownTableRow('Branch', source.spec?.ref?.branch, markdown);
			generateMarkdownTableRow('Commit', source.spec?.ref?.commit, markdown);
		}
		else if (source.kind === 'HelmRepository') {
			generateMarkdownTableRow('URL', source.spec.url, markdown);
		}
		else if (source.kind === 'Bucket') {
			generateMarkdownTableRow('Name', source.spec.bucketName, markdown);
			generateMarkdownTableRow('Endpoint', source.spec.endpoint, markdown);
			generateMarkdownTableRow('Provider', source.spec.provider, markdown);
			generateMarkdownTableRow('Insecure', source.spec.insecure, markdown);
		}

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(source, null, '  '), 'json');
		}

		return markdown;
	}
}
