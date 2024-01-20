import * as k8s from '@kubernetes/client-node';
import { MarkdownString } from 'vscode';

import { GitOpsTemplate } from 'types/flux/gitOpsTemplate';
import { ToolkitObject } from 'types/flux/object';
import { Pipeline } from 'types/flux/pipeline';
import { Deployment, Kind, Namespace } from 'types/kubernetes/kubernetesTypes';
import { shortenRevision } from './stringUtils';

export type KnownTreeNodeResources = Namespace | Deployment | ToolkitObject | GitOpsTemplate | Pipeline;


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
 * @param obj Standard kubernetes object
 * @returns vscode MarkdownString object
 */
export function createMarkdownTable(obj: KnownTreeNodeResources): MarkdownString {
	const markdown = new MarkdownString(undefined, true);
	markdown.isTrusted = true;
	// Create table header
	markdown.appendMarkdown('Property | Value\n');
	markdown.appendMarkdown(':--- | :---\n');

	// Should exist on every object
	createMarkdownTableRow('kind', obj.kind, markdown);
	createMarkdownTableRow('name', obj.metadata.name, markdown);
	createMarkdownTableRow('namespace', obj.metadata.namespace, markdown);

	// Object-specific properties
	if (obj.kind === Kind.GitRepository) {
		createMarkdownTableRow('spec.suspend', obj.spec?.suspend === undefined ? false : obj.spec?.suspend, markdown);
		createMarkdownTableRow('spec.url', obj.spec?.url, markdown);
		createMarkdownTableRow('spec.ref.commit', obj.spec?.ref?.commit, markdown);
		createMarkdownTableRow('spec.ref.branch', obj.spec?.ref?.branch, markdown);
		createMarkdownTableRow('spec.ref.tag', obj.spec?.ref?.tag, markdown);
		createMarkdownTableRow('spec.ref.semver', obj.spec?.ref?.semver, markdown);
	} else if (obj.kind === Kind.OCIRepository) {
		createMarkdownTableRow('spec.url', obj.spec?.url, markdown);
		createMarkdownTableRow('spec.ref.digest', obj.spec?.ref?.digest, markdown);
		createMarkdownTableRow('spec.ref.semver', obj.spec?.ref?.semver, markdown);
		createMarkdownTableRow('spec.ref.tag', obj.spec?.ref?.tag, markdown);
	} else if (obj.kind === Kind.HelmRepository) {
		createMarkdownTableRow('spec.url', obj.spec?.url, markdown);
		createMarkdownTableRow('spec.type', obj.spec?.type, markdown);
	} else if (obj.kind === Kind.Bucket) {
		createMarkdownTableRow('spec.bucketName', obj.spec?.bucketName, markdown);
		createMarkdownTableRow('spec.endpoint', obj.spec?.endpoint, markdown);
		createMarkdownTableRow('spec.provider', obj.spec?.provider, markdown);
		createMarkdownTableRow('spec.insecure', obj.spec?.insecure, markdown);
	} else if (obj.kind === Kind.Kustomization) {
		const sourceRef = `${obj.spec?.sourceRef?.kind}/${obj.spec?.sourceRef?.name}.${obj.spec?.sourceRef?.namespace || obj.metadata.namespace}`;
		createMarkdownTableRow('source', sourceRef, markdown);

		createMarkdownTableRow('spec.suspend', obj.spec?.suspend === undefined ? false : obj.spec?.suspend, markdown);
		createMarkdownTableRow('spec.prune', obj.spec?.prune, markdown);
		createMarkdownTableRow('spec.force', obj.spec?.force, markdown);
		createMarkdownTableRow('spec.path', obj.spec?.path, markdown);
	} else if (obj.kind === Kind.HelmRelease) {
		const sourceRef = `${obj.spec?.chart?.spec?.sourceRef?.kind}/${obj.spec?.chart?.spec?.sourceRef?.name}.${obj.spec?.chart?.spec?.sourceRef?.namespace || obj.metadata.namespace}`;
		createMarkdownTableRow('source', sourceRef, markdown);

		createMarkdownTableRow('spec.suspend', obj.spec?.suspend === undefined ? false : obj.spec?.suspend, markdown);
		createMarkdownTableRow('spec.chart.spec.chart', obj.spec?.chart?.spec?.chart, markdown);

		createMarkdownTableRow('spec.chart.spec.version', obj.spec?.chart?.spec?.version, markdown);
	} else if (obj.kind === Kind.Canary) {
		createMarkdownTableRow('spec.suspend', obj.spec?.suspend === undefined ? false : obj.spec?.suspend, markdown);

		createMarkdownTableRow('phase', obj.status.phase, markdown);
		createMarkdownTableRow('failedChecks', obj.status.failedChecks, markdown);
		createMarkdownTableRow('canaryWeight', obj.status.canaryWeight, markdown);
		createMarkdownTableRow('iterations', obj.status.iterations, markdown);
		createMarkdownTableRow('lastAppliedSpec', obj.status.lastAppliedSpec, markdown);
		createMarkdownTableRow('lastPromotedSpec', obj.status.lastPromotedSpec, markdown);
		createMarkdownTableRow('lastTransitionTime', obj.status.lastTransitionTime, markdown);
	} else if (obj.kind === Kind.Deployment) {
		createMarkdownTableRow('spec.paused', obj.spec?.paused, markdown);
		createMarkdownTableRow('spec.minReadySeconds', obj.spec?.minReadySeconds, markdown);
		createMarkdownTableRow('spec.progressDeadlineSeconds', obj.spec?.progressDeadlineSeconds, markdown);
	} else if (obj.kind === Kind.Pipeline) {
		if(obj.spec?.promotion?.manual) {
			createMarkdownTableRow('promotion.manual', obj.spec?.promotion?.manual, markdown);
		}

		if(obj.spec?.promotion?.strategy.notification) {
			createMarkdownTableRow('promotion.strategy.notification', true, markdown);
		}

		const strategy = obj.spec?.promotion?.strategy as any;
		if(strategy['pull-request']) {
			createMarkdownTableRow('pull-request.type', strategy['pull-request'].type, markdown);
			createMarkdownTableRow('pull-request.url', strategy['pull-request'].url, markdown);
			createMarkdownTableRow('pull-request.baseBranch', strategy['pull-request'].baseBranch, markdown);
		}

		createMarkdownTableRow('spec.appRef.kind', obj.spec?.appRef.kind, markdown);
		createMarkdownTableRow('spec.appRef.name', obj.spec?.appRef.name, markdown);
	}

	// Should exist on multiple objects
	if(obj.spec) {
		if ('interval' in obj.spec) {
			createMarkdownTableRow('spec.interval', obj.spec?.interval, markdown);
		}
		if ('timeout' in obj.spec) {
			createMarkdownTableRow('spec.timeout', obj.spec?.timeout, markdown);
		}
	}

	const fluxStatus = obj.status as any;

	if(fluxStatus?.lastAttemptedRevision) {
		createMarkdownTableRow('attempted', shortenRevision(fluxStatus.lastAttemptedRevision), markdown);
	}

	if(fluxStatus?.lastAppliedRevision) {
		createMarkdownTableRow('applied', shortenRevision(fluxStatus.lastAppliedRevision), markdown);
	}


	if(obj.status?.conditions) {
		const conditions = obj.status.conditions as any[];
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
