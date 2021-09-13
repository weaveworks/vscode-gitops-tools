import { MarkdownString } from 'vscode';
import { HelmRelease } from '../kubernetes/helmRelease';
import { Kustomize } from '../kubernetes/kustomize';
import { generateMarkdownTableHeader, generateMarkdownTableRow } from '../utils/markdownStringUtils';
import { TreeViewItem } from './treeViewItem';

/**
 * Base class for all Deployment tree view items.
 */
export class DeploymentTreeViewItem extends TreeViewItem {

	// TODO: refactor this to pluck object properties we want to include in markdown tooltips
	// and handle it genericallly for all tree view items in new ./utils/stringUtils.ts helper module
	/**
	 * Creates markdwon string for Deployment tree view item tooltip.
	 * @param deployment Kustomize or HelmRelease deployment object.
	 * @param showJsonConfig Optional show Json config for dev debug.
	 * @returns Markdown string to use for Deployment tree view item tooltip.
	 */
	getMarkdown(deployment: Kustomize | HelmRelease,
		showJsonConfig: boolean = false): MarkdownString {

		const markdown: MarkdownString = new MarkdownString();
		generateMarkdownTableHeader(markdown);
		generateMarkdownTableRow('Api version', deployment.apiVersion, markdown);
		generateMarkdownTableRow('Kind', deployment.kind, markdown);
		generateMarkdownTableRow('Name', deployment.metadata.name, markdown);
		generateMarkdownTableRow('Namespace', deployment.metadata.namespace, markdown);
		generateMarkdownTableRow('Interval', deployment.spec.interval, markdown);
		generateMarkdownTableRow('Timeout', deployment.spec.timeout, markdown);

		if (deployment.kind === 'Kustomization') {
			generateMarkdownTableRow('Prune', deployment.spec.prune, markdown);
			generateMarkdownTableRow('Source ref kind', deployment.spec.sourceRef.kind, markdown);
			generateMarkdownTableRow('Source ref name', deployment.spec.sourceRef.name, markdown);
			generateMarkdownTableRow('Force', deployment.spec.force, markdown);
			generateMarkdownTableRow('Path', deployment.spec.path, markdown);
		}
		else if (deployment.kind === 'HelmRelease') {
			generateMarkdownTableRow('Chart name', deployment.spec.chart.spec.chart, markdown);
			generateMarkdownTableRow('Chart source ref kind', deployment.spec.chart.spec.sourceRef.kind, markdown);
			generateMarkdownTableRow('Chart source ref name', deployment.spec.chart.spec.sourceRef.name, markdown);
			generateMarkdownTableRow('Chart version', deployment.spec.chart.spec.version, markdown);
		}

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(deployment, null, '  '), 'json');
		}

		return markdown;
	}

}
