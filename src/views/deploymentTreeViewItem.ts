import { MarkdownString } from 'vscode';
import { HelmRelease } from '../kubernetes/helmRelease';
import { Kustomize } from '../kubernetes/kustomize';
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
		markdown.appendMarkdown(`Property | Value\n`);
		markdown.appendMarkdown(`--- | ---\n`);
		markdown.appendMarkdown(`Api version | ${deployment.apiVersion}\n`);
		markdown.appendMarkdown(`Kind | ${deployment.kind}\n`);

		if (deployment.metadata.name) {
			markdown.appendMarkdown(`Name | ${deployment.metadata.name}\n`);
		}

		if (deployment.metadata.namespace) {
			markdown.appendMarkdown(`Namespace | ${deployment.metadata.namespace}\n`);
		}

		markdown.appendMarkdown(`Interval | ${deployment.spec.interval}\n`);
		if (deployment.spec.timeout) {
			markdown.appendMarkdown(`Timeout | ${deployment.spec.timeout}\n`);
		}

		if (deployment.kind === 'Kustomization') {
			markdown.appendMarkdown(`Prune | ${deployment.spec.prune}\n`);
			markdown.appendMarkdown(`Source ref kind | ${deployment.spec.sourceRef.kind}\n`);
			markdown.appendMarkdown(`Source ref name | ${deployment.spec.sourceRef.name}\n`);

			if (deployment.spec.force !== undefined) {
				markdown.appendMarkdown(`Force | ${deployment.spec.force}\n`);
			}

			if (deployment.spec.path) {
				markdown.appendMarkdown(`Path | ${deployment.spec.path}\n`);
			}
		}
		else if (deployment.kind === 'HelmRelease') {
			markdown.appendMarkdown(`Chart name | ${deployment.spec.chart.spec.chart}\n`);
			markdown.appendMarkdown(`Chart source ref kind | ${deployment.spec.chart.spec.sourceRef.kind}\n`);
			markdown.appendMarkdown(`Chart source ref name | ${deployment.spec.chart.spec.sourceRef.name}\n`);
			if (deployment.spec.chart.spec.version) {
				markdown.appendMarkdown(`Chart version | ${deployment.spec.chart.spec.version}\n`);
			}
		}

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(deployment, null, '  '), 'json');
		}

		return markdown;
	}

}
