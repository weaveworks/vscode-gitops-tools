import * as k8s from '@kubernetes/client-node';

export type KubernetesObject = k8s.KubernetesObject & {
	spec?: unknown;
	status?: unknown;
};

export type KubernetesListObject<T extends KubernetesObject> = k8s.KubernetesListObject<T>;
export type Condition = k8s.V1Condition;

// Specify types from `@kubernetes/client-node`
export type Namespace = Required<k8s.V1Namespace> & {
	readonly kind: Kind.Namespace;
};

export type Deployment = Required<k8s.V1Deployment> & {
	readonly kind: Kind.Deployment;
};

export type ConfigMap = Required<k8s.V1ConfigMap> & {
	readonly kind: Kind.ConfigMap;
};

export type Node = Required<k8s.V1Node> & {
	readonly kind: Kind.Node;
};

export type Pod = Required<k8s.V1Pod> & {
	readonly kind: Kind.Pod;
};

/**
 * Defines supported Kubernetes object kinds.
 */
export const enum Kind {
	List = 'List',
	Bucket = 'Bucket',
	GitRepository = 'GitRepository',
	OCIRepository = 'OCIRepository',
	HelmRepository = 'HelmRepository',
	HelmRelease = 'HelmRelease',
	Kustomization = 'Kustomization',
	Deployment = 'Deployment',
	Namespace = 'Namespace',
	Node = 'Node',
	Pod = 'Pod',

	ConfigMap = 'ConfigMap',

	GitOpsTemplate = 'GitOpsTemplate',
}

export const enum FullyKind {
	Bucket = 'Buckets.source.toolkit.fluxcd.io',
	GitRepository = 'GitRepositories.source.toolkit.fluxcd.io',
	OCIRepository = 'OCIRepositories.source.toolkit.fluxcd.io',
	HelmRepository = 'HelmRepositories.source.toolkit.fluxcd.io',
	HelmRelease = 'HelmReleases.helm.toolkit.fluxcd.io',
	Kustomization = 'Kustomizations.kustomize.toolkit.fluxcd.io',
	GitOpsTemplate = 'GitOpsTemplates.templates.weave.works',
	List = '',
	Deployment = '',
	Node = '',
	Pod = '',
	Namespace = '',
	ConfigMap = '',
}

type KindMapType = {
	[id in Kind]: FullyKind;
};

export const FullyQualifiedKinds: KindMapType = {
	Bucket: FullyKind.Bucket,
	GitRepository: FullyKind.GitRepository,
	OCIRepository: FullyKind.OCIRepository,
	HelmRepository: FullyKind.HelmRepository,
	HelmRelease: FullyKind.HelmRelease,
	Kustomization: FullyKind.Kustomization,
	GitOpsTemplate: FullyKind.GitOpsTemplate,
	List: FullyKind.List,
	Deployment: FullyKind.Deployment,
	Node: FullyKind.Node,
	Pod: FullyKind.Pod,
	Namespace: FullyKind.Namespace,
	ConfigMap: FullyKind.ConfigMap,
};

export const enum SourceKind {
	Bucket = 'Bucket',
	GitRepository = 'GitRepository',
	OCIRepository = 'OCIRepository',
	HelmRepository = 'HelmRepository',
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
