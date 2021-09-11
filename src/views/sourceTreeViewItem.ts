import { MarkdownString } from 'vscode';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRepository } from '../kubernetes/helmRepository';
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
		markdown.appendMarkdown(`Property | Value\n`);
		markdown.appendMarkdown(`--- | ---\n`);
		markdown.appendMarkdown(`Api version | ${source.apiVersion}\n`);
		markdown.appendMarkdown(`Kind | ${source.kind}\n`);

		if (source.metadata.name) {
			markdown.appendMarkdown(`Name | ${source.metadata.name}\n`);
		}

		if (source.metadata.namespace) {
			markdown.appendMarkdown(`Namespace | ${source.metadata.namespace}\n`);
		}

		markdown.appendMarkdown(`Interval | ${source.spec.interval}\n`);
		if (source.spec.timeout) {
			markdown.appendMarkdown(`Timeout | ${source.spec.timeout}\n`);
		}

		if (source.kind === 'GitRepository') {
			markdown.appendMarkdown(`URL | ${source.spec.url}\n`);
			if (source.spec.ref) {
				if (source.spec.ref.branch) {
					markdown.appendMarkdown(`Branch | ${source.spec.ref.branch}\n`);
				}

				if (source.spec.ref.commit) {
					markdown.appendMarkdown(`Commit | ${source.spec.ref.commit}\n`);
				}
			}
		}
		else if (source.kind === 'HelmRepository') {
			markdown.appendMarkdown(`URL | ${source.spec.url}\n`);
		}
		else if (source.kind === 'Bucket') {
			markdown.appendMarkdown(`Name | ${source.spec.bucketName}\n`);
			markdown.appendMarkdown(`Endpoint | ${source.spec.endpoint}\n`);
			if (source.spec.provider) {
				markdown.appendMarkdown(`Provider | ${source.spec.provider}\n`);
			}
			if (source.spec.insecure !== undefined) {
				markdown.appendMarkdown(`Insecure | ${source.spec.insecure}\n`);
			}
		}

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(source, null, '  '), 'json');
		}

		return markdown;
	}
}
