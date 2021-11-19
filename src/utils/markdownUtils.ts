import { MarkdownString } from 'vscode';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRelease } from '../kubernetes/helmRelease';
import { HelmRepository } from '../kubernetes/helmRepository';
import { Cluster } from '../kubernetes/kubernetesConfig';
import { Deployment, KubernetesObjectKinds, Namespace } from '../kubernetes/kubernetesTypes';
import { Kustomize } from '../kubernetes/kustomize';

export type KnownTreeNodeResources = Cluster | Namespace | Bucket | GitRepository | HelmRepository | HelmRelease | Kustomize | Deployment;

/**
 * Create markdown table for tree view item hovers.
 * 2 clumns, left aligned.
 * @param kubernetesObject Standard kubernetes object
 * @returns vscode MarkdownString object
 */
export function createMarkdownTable(kubernetesObject: KnownTreeNodeResources): MarkdownString {
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
 * Append horizontal rule `<hr>`
 * @param markdown object of vscode type MarkdownString
 */
export function createMarkdownHr(markdown: MarkdownString) {
	markdown.appendMarkdown('\n\n---\n\n');
}

/**
 * Append an error message
 * @param markdown object of vscode type MarkdownString
 */
export function createMarkdownError(prefix: string, error = '', markdown: MarkdownString) {
	markdown.appendMarkdown(`<span style="color:#f14c4c;">$(error)</span> ${prefix}: ${error}\n\n`);
}
