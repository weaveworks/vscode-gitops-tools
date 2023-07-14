import * as k8s from '@kubernetes/client-node';
import { MarkdownString } from 'vscode';

import { Bucket } from 'types/flux/bucket';
import { GitOpsTemplate } from 'types/flux/gitOpsTemplate';
import { GitRepository } from 'types/flux/gitRepository';
import { HelmRelease } from 'types/flux/helmRelease';
import { HelmRepository } from 'types/flux/helmRepository';
import { Kustomization } from 'types/flux/kustomization';
import { OCIRepository } from 'types/flux/ociRepository';
import { Deployment, Kind, Namespace } from 'types/kubernetes/kubernetesTypes';
import { shortenRevision } from './stringUtils';

export type KnownTreeNodeResources = Namespace | Bucket | GitRepository | OCIRepository | HelmRepository | HelmRelease | Kustomization | Deployment | GitOpsTemplate;


export function createContextMarkdownTable(context: k8s.Context, cluster?: k8s.Cluster): MarkdownString {
	const markdown = new MarkdownString(undefined, true);
	markdown.isTrusted = true;
	// Create table header
	markdown.appendMarkdown('Property | Value\n');
	markdown.appendMarkdown(':--- | :---\n');

	// Cluster type is incompatible with the rest. Handle it first.
	createMarkdownTableRow('context name', context.name, markdown);
	createMarkdownTableRow('cluster name', cluster?.name, markdown);
	createMarkdownTableRow('cluster.server', cluster?.server, markdown);
	return markdown;
}

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

	// Should exist on every object
	createMarkdownTableRow('kind', kubernetesObject.kind, markdown);
	createMarkdownTableRow('name', kubernetesObject.metadata?.name, markdown);
	createMarkdownTableRow('namespace', kubernetesObject.metadata?.namespace, markdown);

	// Object-specific properties
	if (kubernetesObject.kind === Kind.GitRepository) {
		createMarkdownTableRow('spec.suspend', kubernetesObject.spec?.suspend === undefined ? false : kubernetesObject.spec?.suspend, markdown);
		createMarkdownTableRow('spec.url', kubernetesObject.spec?.url, markdown);
		createMarkdownTableRow('spec.ref.commit', kubernetesObject.spec?.ref?.commit, markdown);
		createMarkdownTableRow('spec.ref.branch', kubernetesObject.spec?.ref?.branch, markdown);
		createMarkdownTableRow('spec.ref.tag', kubernetesObject.spec?.ref?.tag, markdown);
		createMarkdownTableRow('spec.ref.semver', kubernetesObject.spec?.ref?.semver, markdown);
	} else if (kubernetesObject.kind === Kind.OCIRepository) {
		createMarkdownTableRow('spec.url', kubernetesObject.spec?.url, markdown);
		createMarkdownTableRow('spec.ref.digest', kubernetesObject.spec?.ref?.digest, markdown);
		createMarkdownTableRow('spec.ref.semver', kubernetesObject.spec?.ref?.semver, markdown);
		createMarkdownTableRow('spec.ref.tag', kubernetesObject.spec?.ref?.tag, markdown);
	} else if (kubernetesObject.kind === Kind.HelmRepository) {
		createMarkdownTableRow('spec.url', kubernetesObject.spec?.url, markdown);
		createMarkdownTableRow('spec.type', kubernetesObject.spec?.type, markdown);
	} else if (kubernetesObject.kind === Kind.Bucket) {
		createMarkdownTableRow('spec.bucketName', kubernetesObject.spec?.bucketName, markdown);
		createMarkdownTableRow('spec.endpoint', kubernetesObject.spec?.endpoint, markdown);
		createMarkdownTableRow('spec.provider', kubernetesObject.spec?.provider, markdown);
		createMarkdownTableRow('spec.insecure', kubernetesObject.spec?.insecure, markdown);
	} else if (kubernetesObject.kind === Kind.Kustomization) {
		const sourceRef = `${kubernetesObject.spec?.sourceRef?.kind}/${kubernetesObject.spec?.sourceRef?.name}.${kubernetesObject.spec?.sourceRef?.namespace || kubernetesObject.metadata?.namespace}`;
		createMarkdownTableRow('source', sourceRef, markdown);

		createMarkdownTableRow('spec.suspend', kubernetesObject.spec?.suspend === undefined ? false : kubernetesObject.spec?.suspend, markdown);
		createMarkdownTableRow('spec.prune', kubernetesObject.spec?.prune, markdown);
		createMarkdownTableRow('spec.force', kubernetesObject.spec?.force, markdown);
		createMarkdownTableRow('spec.path', kubernetesObject.spec?.path, markdown);
	} else if (kubernetesObject.kind === Kind.HelmRelease) {
		const sourceRef = `${kubernetesObject.spec?.chart?.spec?.sourceRef?.kind}/${kubernetesObject.spec?.chart?.spec?.sourceRef?.name}.${kubernetesObject.spec?.chart?.spec?.sourceRef?.namespace || kubernetesObject.metadata?.namespace}`;
		createMarkdownTableRow('source', sourceRef, markdown);

		createMarkdownTableRow('spec.suspend', kubernetesObject.spec?.suspend === undefined ? false : kubernetesObject.spec?.suspend, markdown);
		createMarkdownTableRow('spec.chart.spec.chart', kubernetesObject.spec?.chart?.spec?.chart, markdown);

		createMarkdownTableRow('spec.chart.spec.version', kubernetesObject.spec?.chart?.spec?.version, markdown);
	} else if (kubernetesObject.kind === Kind.Deployment) {
		createMarkdownTableRow('spec.paused', kubernetesObject.spec?.paused, markdown);
		createMarkdownTableRow('spec.minReadySeconds', kubernetesObject.spec?.minReadySeconds, markdown);
		createMarkdownTableRow('spec.progressDeadlineSeconds', kubernetesObject.spec?.progressDeadlineSeconds, markdown);
	}

	// Should exist on multiple objects
	if(kubernetesObject.spec) {
		if ('interval' in kubernetesObject.spec) {
			createMarkdownTableRow('spec.interval', kubernetesObject.spec?.interval, markdown);
		}
		if ('timeout' in kubernetesObject.spec) {
			createMarkdownTableRow('spec.timeout', kubernetesObject.spec?.timeout, markdown);
		}
	}

	const fluxStatus = kubernetesObject.status as any;

	if(fluxStatus?.lastAttemptedRevision) {
		createMarkdownTableRow('attempted', shortenRevision(fluxStatus.lastAttemptedRevision), markdown);
	}

	if(fluxStatus?.lastAppliedRevision) {
		createMarkdownTableRow('applied', shortenRevision(fluxStatus.lastAppliedRevision), markdown);
	}


	if(kubernetesObject.status?.conditions) {
		const conditions = kubernetesObject.status.conditions as any[];
		for (const c of conditions) {
			if(c.type === 'SourceVerified' && c.status === 'True') {
				const message = `${c.message.replace('verified signature of revision', 'verified').slice(0, 48)}...`;
				createMarkdownTableRow('cosign', message, markdown);
			}
		}
	}


	// Only show the first 11 lines (2 lines - header)
	const markdownAsLines = markdown.value.split('\n');
	if (markdownAsLines.length > 13) {
		markdown.value = markdownAsLines
			.slice(0, 13)
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
