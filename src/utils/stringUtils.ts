import { MarkdownString } from 'vscode';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRelease } from '../kubernetes/helmRelease';
import { HelmRepository } from '../kubernetes/helmRepository';
import { Cluster } from '../kubernetes/kubernetesConfig';
import { Deployment, KubernetesObjectKinds, Namespace } from '../kubernetes/kubernetesTypes';
import { Kustomize } from '../kubernetes/kustomize';

/**
 * Shortens revision string for display in GitOps tree views.
 * @param revision Revision string to shorten.
 * @returns Short revision string with max 7 characters.
 */
export function shortenRevision(revision: string = ''): string {
	if (revision.includes('/')) {
		// git revision includes branch name
		const [gitBranch, gitRevision] = revision.split('/');
		return [gitBranch, '/', gitRevision.slice(0, 7)].join('');
	} else {
		return revision.slice(0, 7);
	}
}

/**
 * Create markdown table for tree view item hovers.
 * 2 clumns, left aligned.
 * @param kubernetesObject Standard kubernetes object
 * @returns vscode MarkdownString object
 */
export function createMarkdownTable(kubernetesObject: Cluster | Namespace | Bucket | GitRepository | HelmRepository | HelmRelease | Kustomize | Deployment): MarkdownString {
	const markdown = new MarkdownString(undefined, true);
	markdown.isTrusted = true;
	// Create table header
	markdown.appendMarkdown('Property | Value\n');
	markdown.appendMarkdown(':--- | :---\n');

	// Cluster type is incompatible with the rest. Handle it first.
	if ('cluster' in kubernetesObject) {
		createMarkdownTableRow('name', kubernetesObject.name, markdown);
		createMarkdownTableRow('cluster.server', kubernetesObject.cluster.server, markdown);
		createMarkdownTableRow('cluster.certificate-authority', kubernetesObject.cluster['certificate-authority'], markdown);
		createMarkdownTableRow('cluster.certificate-authority-data', kubernetesObject.cluster['certificate-authority-data'], markdown);
		return markdown;
	}

	// Should exist on every object
	createMarkdownTableRow('apiVersion', kubernetesObject.apiVersion, markdown);
	createMarkdownTableRow('kind', kubernetesObject.kind, markdown);
	createMarkdownTableRow('name', kubernetesObject.metadata?.name, markdown);
	createMarkdownTableRow('namespace', kubernetesObject.metadata?.namespace, markdown);

	// Should exist on multiple objects
	if (kubernetesObject.spec) {
		if ('interval' in kubernetesObject.spec) {
			createMarkdownTableRow('spec.interval', kubernetesObject.spec.interval, markdown);
		}
		if ('timeout' in kubernetesObject.spec) {
			createMarkdownTableRow('spec.timeout', kubernetesObject.spec.timeout, markdown);
		}
	}

	// Object-specific properties
	if (kubernetesObject.kind === KubernetesObjectKinds.GitRepository) {
		createMarkdownTableRow('spec.url', kubernetesObject.spec?.url, markdown);
		createMarkdownTableRow('spec.ref.branch', kubernetesObject.spec.ref?.branch, markdown);
		createMarkdownTableRow('spec.ref.commit', kubernetesObject.spec.ref?.commit, markdown);
		createMarkdownTableRow('spec.suspend', kubernetesObject.spec.suspend === undefined ? false : kubernetesObject.spec.suspend, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.HelmRepository) {
		createMarkdownTableRow('spec.url', kubernetesObject.spec?.url, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.Bucket) {
		createMarkdownTableRow('spec.bucketName', kubernetesObject.spec.bucketName, markdown);
		createMarkdownTableRow('spec.endpoint', kubernetesObject.spec.endpoint, markdown);
		createMarkdownTableRow('spec.provider', kubernetesObject.spec.provider, markdown);
		createMarkdownTableRow('spec.insecure', kubernetesObject.spec.insecure, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.Kustomization) {
		createMarkdownTableRow('spec.prune', kubernetesObject.spec.prune, markdown);
		createMarkdownTableRow('spec.sourceRef.kind', kubernetesObject.spec.sourceRef.kind, markdown);
		createMarkdownTableRow('spec.sourceRef.name', kubernetesObject.spec.sourceRef.name, markdown);
		createMarkdownTableRow('spec.force', kubernetesObject.spec.force, markdown);
		createMarkdownTableRow('spec.path', kubernetesObject.spec.path, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.HelmRelease) {
		createMarkdownTableRow('spec.chart.spec.chart', kubernetesObject.spec.chart.spec.chart, markdown);
		createMarkdownTableRow('spec.chart.spec.sourceRef.kind', kubernetesObject.spec.chart.spec.sourceRef.kind, markdown);
		createMarkdownTableRow('spec.chart.spec.sourceRef.name', kubernetesObject.spec.chart.spec.sourceRef.name, markdown);
		createMarkdownTableRow('spec.chart.spec.version', kubernetesObject.spec.chart.spec.version, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.Deployment) {
		createMarkdownTableRow('spec.paused', kubernetesObject.spec.paused, markdown);
		createMarkdownTableRow('spec.minReadySeconds', kubernetesObject.spec.minReadySeconds, markdown);
		createMarkdownTableRow('spec.progressDeadlineSeconds', kubernetesObject.spec.progressDeadlineSeconds, markdown);
	}

	// Only show the first 10 lines (2 lines - header)
	const markdownAsLines = markdown.value.split('\n');
	if (markdownAsLines.length > 12) {
		markdown.value = markdownAsLines
			.slice(0, 12)
			.join('\n');
	}

	return markdown;
}

/**
 * Create markdown table row (only if the value is not equal `undefined`)
 * @param propertyName First table column value
 * @param propertyValue Second table column value
 * @param markdown object of vscode type MarkdownString
 */
function createMarkdownTableRow(propertyName: string, propertyValue: string | boolean | number | undefined, markdown: MarkdownString) {
	if (propertyValue === undefined) {
		return;
	}
	markdown.appendMarkdown(`${propertyName} | ${propertyValue}\n`);
}

/**
 * Remove not allowed symbols, cast letters to lowercase
 * and truncate the string to match the RFC 1123:
 *
 * - contain no more than 253 characters
 * - contain only lowercase alphanumeric characters, '-' or '.'
 * - start with an alphanumeric character
 * - end with an alphanumeric character
 * @param str string to sanitize
 */
export function sanitizeRFC1123(str: string): string {
	const notAllowedSymbolsRegex = /[^a-z0-9.-]/g;
	const notAllowedSymbolsAtTheStartRegex = /^[^a-z0-9]+/;
	const notAllowedSymbolsAtTheEndRegex = /[^a-z0-9]+$/;

	const lowercaseString = str.toLocaleLowerCase();

	const sanitizedString = lowercaseString
		.replace(notAllowedSymbolsRegex, '')
		.replace(notAllowedSymbolsAtTheStartRegex, '')
		.replace(notAllowedSymbolsAtTheEndRegex, '');

	return truncateString(sanitizedString, 253);
}

/**
 * Reduce the string length if it's longer than the allowed number of characters.
 * @param str string to truncate
 * @param maxChars maximum length of the string
 */
export function truncateString(str: string, maxChars: number): string {
	const chars = [...str];
	return chars.length > maxChars ? `${chars.slice(0, maxChars).join('')}…` : str;
}
