import { MarkdownString } from 'vscode';
import { Bucket } from '../kubernetes/types/flux/bucket';
import { GitRepository } from '../kubernetes/types/flux/gitRepository';
import { OCIRepository } from '../kubernetes/types/flux/ociRepository';
import { HelmRelease } from '../kubernetes/types/flux/helmRelease';
import { HelmRepository } from '../kubernetes/types/flux/helmRepository';
import { KubernetesCluster, KubernetesContextWithCluster } from '../kubernetes/types/kubernetesConfig';
import { Deployment, KubernetesObjectKinds, Namespace } from '../kubernetes/types/kubernetesTypes';
import { Kustomize } from '../kubernetes/types/flux/kustomize';

export type KnownTreeNodeResources = KubernetesContextWithCluster | Namespace | Bucket | GitRepository | OCIRepository | HelmRepository | HelmRelease | Kustomize | Deployment;

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
	if ('context' in kubernetesObject) {
		createMarkdownTableRow('context name', kubernetesObject.name, markdown);
		createMarkdownTableRow('cluster name', kubernetesObject.context.clusterInfo?.name, markdown);
		createMarkdownTableRow('cluster.server', kubernetesObject.context.clusterInfo?.cluster?.server, markdown);
		createMarkdownTableRow('cluster.certificate-authority', kubernetesObject.context.clusterInfo?.cluster?.['certificate-authority'], markdown);
		createMarkdownTableRow('cluster.certificate-authority-data', kubernetesObject.context.clusterInfo?.cluster?.['certificate-authority-data'], markdown);
		return markdown;
	}

	// Should exist on every object
	createMarkdownTableRow('apiVersion', kubernetesObject.apiVersion, markdown);
	createMarkdownTableRow('kind', kubernetesObject.kind, markdown);
	createMarkdownTableRow('name', kubernetesObject.metadata?.name, markdown);
	createMarkdownTableRow('namespace', kubernetesObject.metadata?.namespace, markdown);

	// Object-specific properties
	if (kubernetesObject.kind === KubernetesObjectKinds.GitRepository) {
		createMarkdownTableRow('spec.suspend', kubernetesObject.spec?.suspend === undefined ? false : kubernetesObject.spec?.suspend, markdown);
		createMarkdownTableRow('spec.url', kubernetesObject.spec?.url, markdown);
		createMarkdownTableRow('spec.ref.commit', kubernetesObject.spec?.ref?.commit, markdown);
		createMarkdownTableRow('spec.ref.branch', kubernetesObject.spec?.ref?.branch, markdown);
		createMarkdownTableRow('spec.ref.tag', kubernetesObject.spec?.ref?.tag, markdown);
		createMarkdownTableRow('spec.ref.semver', kubernetesObject.spec?.ref?.semver, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.OCIRepository) {
		createMarkdownTableRow('spec.url', kubernetesObject.spec?.url, markdown);
		createMarkdownTableRow('spec.ref.digest', kubernetesObject.spec?.ref?.digest, markdown);
		createMarkdownTableRow('spec.ref.semver', kubernetesObject.spec?.ref?.semver, markdown);
		createMarkdownTableRow('spec.ref.tag', kubernetesObject.spec?.ref?.tag, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.HelmRepository) {
		createMarkdownTableRow('spec.url', kubernetesObject.spec?.url, markdown);
		createMarkdownTableRow('spec.type', kubernetesObject.spec?.type, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.Bucket) {
		createMarkdownTableRow('spec.bucketName', kubernetesObject.spec?.bucketName, markdown);
		createMarkdownTableRow('spec.endpoint', kubernetesObject.spec?.endpoint, markdown);
		createMarkdownTableRow('spec.provider', kubernetesObject.spec?.provider, markdown);
		createMarkdownTableRow('spec.insecure', kubernetesObject.spec?.insecure, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.Kustomization) {
		createMarkdownTableRow('spec.suspend', kubernetesObject.spec?.suspend === undefined ? false : kubernetesObject.spec?.suspend, markdown);
		createMarkdownTableRow('spec.prune', kubernetesObject.spec?.prune, markdown);
		createMarkdownTableRow('spec.sourceRef.kind', kubernetesObject.spec?.sourceRef?.kind, markdown);
		createMarkdownTableRow('spec.sourceRef.name', kubernetesObject.spec?.sourceRef?.name, markdown);
		createMarkdownTableRow('spec.force', kubernetesObject.spec?.force, markdown);
		createMarkdownTableRow('spec.path', kubernetesObject.spec?.path, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.HelmRelease) {
		createMarkdownTableRow('spec.suspend', kubernetesObject.spec?.suspend === undefined ? false : kubernetesObject.spec?.suspend, markdown);
		createMarkdownTableRow('spec.chart.spec.chart', kubernetesObject.spec?.chart?.spec?.chart, markdown);
		createMarkdownTableRow('spec.chart.spec.sourceRef.kind', kubernetesObject.spec?.chart?.spec?.sourceRef?.kind, markdown);
		createMarkdownTableRow('spec.chart.spec.sourceRef.name', kubernetesObject.spec?.chart?.spec?.sourceRef?.name, markdown);
		createMarkdownTableRow('spec.chart.spec.version', kubernetesObject.spec?.chart?.spec?.version, markdown);
	} else if (kubernetesObject.kind === KubernetesObjectKinds.Deployment) {
		createMarkdownTableRow('spec.paused', kubernetesObject.spec?.paused, markdown);
		createMarkdownTableRow('spec.minReadySeconds', kubernetesObject.spec?.minReadySeconds, markdown);
		createMarkdownTableRow('spec.progressDeadlineSeconds', kubernetesObject.spec?.progressDeadlineSeconds, markdown);
	}

	// Should exist on multiple objects
	if (kubernetesObject.spec) {
		if ('interval' in kubernetesObject.spec) {
			createMarkdownTableRow('spec.interval', kubernetesObject.spec?.interval, markdown);
		}
		if ('timeout' in kubernetesObject.spec) {
			createMarkdownTableRow('spec.timeout', kubernetesObject.spec?.timeout, markdown);
		}
	}

	if(kubernetesObject.status.conditions) {
		const conditions = kubernetesObject.status.conditions as any[];
		for (const c of conditions) {
			if(c.type === 'SourceVerified' && c.status === 'True') {
				const message = `${c.message.replace('verified signature of revision', 'verified').slice(0, 48)}...`;
				createMarkdownTableRow('cosign', message, markdown);
			}
		}
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
