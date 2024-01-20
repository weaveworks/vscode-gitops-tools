import * as k8s from '@kubernetes/client-node';

export type KubernetesListObject<T extends KubernetesObject> = k8s.KubernetesListObject<T>;

export type Metadata = k8s.V1ObjectMeta & {
	// required
	name: string;
	uid: string;
};

export type KubernetesObject = k8s.KubernetesObject & {
	spec?: unknown;
	status?: unknown;
	// required
	kind: string;
	metadata: Metadata;
};

export type Condition = k8s.V1Condition;

// Specify types from `@kubernetes/client-node`
export type Namespace = Required<k8s.V1Namespace> & {
	readonly kind: Kind.Namespace;
	metadata: Metadata;
};

export type Deployment = Required<k8s.V1Deployment> & {
	readonly kind: Kind.Deployment;
	metadata: Metadata;
};

export type ConfigMap = Required<k8s.V1ConfigMap> & {
	readonly kind: Kind.ConfigMap;
	metadata: Metadata;
};

export type Node = Required<k8s.V1Node> & {
	readonly kind: Kind.Node;
	metadata: Metadata;
};

export type Pod = Required<k8s.V1Pod> & {
	readonly kind: Kind.Pod;
	metadata: Metadata;
};

/**
 * Defines supported Kubernetes object kinds.
 */
export const enum Kind {
	Bucket = 'Bucket',
	GitRepository = 'GitRepository',
	OCIRepository = 'OCIRepository',
	HelmRepository = 'HelmRepository',
	HelmRelease = 'HelmRelease',
	Kustomization = 'Kustomization',
	GitOpsTemplate = 'GitOpsTemplate',
	Canary = 'Canary',
	Pipeline = 'Pipeline',
	GitOpsSet = 'GitOpsSet',
	GitopsCluster = 'GitopsCluster',

	Namespace = 'Namespace',
	Deployment = 'Deployment',
	Node = 'Node',
	Pod = 'Pod',

	ConfigMap = 'ConfigMap',
}


const fullKinds: Record<string, string> = {
	Bucket: 'Buckets.source.toolkit.fluxcd.io',
	GitRepository: 'GitRepositories.source.toolkit.fluxcd.io',
	OCIRepository: 'OCIRepositories.source.toolkit.fluxcd.io',
	HelmRepository: 'HelmRepositories.source.toolkit.fluxcd.io',
	HelmRelease: 'HelmReleases.helm.toolkit.fluxcd.io',
	Kustomization: 'Kustomizations.kustomize.toolkit.fluxcd.io',

	GitOpsTemplate: 'GitOpsTemplates.templates.weave.works',
	Canary: 'Canaries.flagger.app',
	Pipeline: 'Pipelines.pipelines.weave.works',
	GitOpsSet: 'GitOpsSets.templates.weave.works',
	GitOpsCluster: 'GitOpsClusters.gitops.weave.works',
};

export function qualifyToolkitKind(kind: string): string {
	return fullKinds[kind] || kind;
}


/*
 * LocalObjectReference contains enough information
 * to let you locate the referenced object inside the same namespace.
 */
export interface LocalObjectReference {

	/**
	 * Name of the referent.
	 * @see https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
	 */
	name: string;
}

/**
 * JSON represents any valid JSON value. These types are supported:
 * bool, int64, float64, string, []interface{}, map[string]interface{} and nil.
 */
export interface KubernetesJSON {
	[key: string]: unknown;
}
