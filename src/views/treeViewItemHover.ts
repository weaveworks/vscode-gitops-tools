import { MarkdownString } from 'vscode';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRelease } from '../kubernetes/helmRelease';
import { HelmRepository } from '../kubernetes/helmRepository';
import { ClusterType } from '../kubernetes/kubernetesConfig';
import { Kustomize } from '../kubernetes/kustomize';

/**
 * Generate hover for cluster tree view item.
 * When developing extension - show the entire cluster object as json.
 */
export function generateClusterHover(cluster: ClusterType, isDev: boolean): MarkdownString {
	const mdHover = new MarkdownString();
	mdHover.appendMarkdown(`Property | Value\n`);
	mdHover.appendMarkdown(`--- | ---\n`);
	mdHover.appendMarkdown(`Name | ${cluster.name}\n`);
	mdHover.appendMarkdown(`Server | ${cluster.cluster.server}\n`);
	if (cluster.cluster['certificate-authority']) {
		mdHover.appendMarkdown(`Certificate authority | ${cluster.cluster['certificate-authority']}`);
	}
	if (cluster.cluster['certificate-authority-data']) {
		mdHover.appendMarkdown(`Certificate authority data | ${cluster.cluster['certificate-authority-data']}`);
	}

	if (isDev) {
			mdHover.appendCodeblock(JSON.stringify(cluster, null, '  '), 'json');
	}

	return mdHover;
}
/**
 * Generate hover for source tree view item.
 * When developing extension - show the entire source object as json.
 */
export function generateSourceHover(source: GitRepository | HelmRepository | Bucket, isDev: boolean): MarkdownString {
	const mdHover = new MarkdownString();
	mdHover.appendMarkdown(`Property | Value\n`);
	mdHover.appendMarkdown(`--- | ---\n`);
	mdHover.appendMarkdown(`Api version | ${source.apiVersion}\n`);
	mdHover.appendMarkdown(`Kind | ${source.kind}\n`);
	if (source.metadata.name) {
		mdHover.appendMarkdown(`Name | ${source.metadata.name}\n`);
	}
	if (source.metadata.namespace) {
		mdHover.appendMarkdown(`Namespace | ${source.metadata.namespace}\n`);
	}
	mdHover.appendMarkdown(`Interval | ${source.spec.interval}\n`);
	if (source.spec.timeout) {
		mdHover.appendMarkdown(`Timeout | ${source.spec.timeout}\n`);
	}

	if (source.kind === 'GitRepository') {
		mdHover.appendMarkdown(`URL | ${source.spec.url}\n`);
		if (source.spec.ref) {
			if (source.spec.ref.branch) {
				mdHover.appendMarkdown(`Branch | ${source.spec.ref.branch}\n`);
			}
			if (source.spec.ref.commit) {
				mdHover.appendMarkdown(`Commit | ${source.spec.ref.commit}\n`);
			}
		}
	} else if (source.kind === 'HelmRepository') {
		mdHover.appendMarkdown(`URL | ${source.spec.url}\n`);
	} else if (source.kind === 'Bucket') {
		mdHover.appendMarkdown(`Name | ${source.spec.bucketName}\n`);
		mdHover.appendMarkdown(`Endpoint | ${source.spec.endpoint}\n`);
		if (source.spec.provider) {
			mdHover.appendMarkdown(`Provider | ${source.spec.provider}\n`);
		}
		if (source.spec.insecure !== undefined) {
			mdHover.appendMarkdown(`Insecure | ${source.spec.insecure}\n`);
		}
	}

	if (isDev) {
			mdHover.appendCodeblock(JSON.stringify(source, null, '  '), 'json');
	}

	return mdHover;
}
/**
 * Generate hover for deployment tree view item.
 * When developing extension - show the entire deployment object as json.
 */
export function generateDeploymentHover(deployment: Kustomize | HelmRelease, isDev: boolean): MarkdownString {
	const mdHover = new MarkdownString();
	mdHover.appendMarkdown(`Property | Value\n`);
	mdHover.appendMarkdown(`--- | ---\n`);
	mdHover.appendMarkdown(`Api version | ${deployment.apiVersion}\n`);
	mdHover.appendMarkdown(`Kind | ${deployment.kind}\n`);
	if (deployment.metadata.name) {
		mdHover.appendMarkdown(`Name | ${deployment.metadata.name}\n`);
	}
	if (deployment.metadata.namespace) {
		mdHover.appendMarkdown(`Namespace | ${deployment.metadata.namespace}\n`);
	}
	mdHover.appendMarkdown(`Interval | ${deployment.spec.interval}\n`);
	if (deployment.spec.timeout) {
		mdHover.appendMarkdown(`Timeout | ${deployment.spec.timeout}\n`);
	}

	if (deployment.kind === 'Kustomization') {
		mdHover.appendMarkdown(`Prune | ${deployment.spec.prune}\n`);
		mdHover.appendMarkdown(`Source ref kind | ${deployment.spec.sourceRef.kind}\n`);
		mdHover.appendMarkdown(`Source ref name | ${deployment.spec.sourceRef.name}\n`);

		if (deployment.spec.force !== undefined) {
			mdHover.appendMarkdown(`Force | ${deployment.spec.force}\n`);
		}
		if (deployment.spec.path) {
			mdHover.appendMarkdown(`Path | ${deployment.spec.path}\n`);
		}
	} else if (deployment.kind === 'HelmRelease') {
		mdHover.appendMarkdown(`Chart name | ${deployment.spec.chart.spec.chart}\n`);
		mdHover.appendMarkdown(`Chart source ref kind | ${deployment.spec.chart.spec.sourceRef.kind}\n`);
		mdHover.appendMarkdown(`Chart source ref name | ${deployment.spec.chart.spec.sourceRef.name}\n`);
		if (deployment.spec.chart.spec.version) {
			mdHover.appendMarkdown(`Chart version | ${deployment.spec.chart.spec.version}\n`);
		}
	}

	if (isDev) {
		mdHover.appendCodeblock(JSON.stringify(deployment, null, '  '), 'json');
	}

	return mdHover;
}