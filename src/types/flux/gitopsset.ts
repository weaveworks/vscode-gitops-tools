import * as k8s from '@kubernetes/client-node';
import { Condition, Kind, KubernetesObject, LocalObjectReference } from 'types/kubernetes/kubernetesTypes';


export interface GitOpsSet extends KubernetesObject {
	readonly kind: Kind.GitOpsSet;
	readonly spec: GitOpsSetSpec;
	readonly status: GitOpsSetStatus;
}

declare interface GitOpsSetSpec {
	suspend?: boolean;
	generators?: GitOpsSetGenerator[];
	templates?: GitOpsSetTemplate[];
	serviceAccountName?: string;
}

declare interface GitOpsSetTemplate {
	repeat?: string;
	content: any;
}

declare interface ClusterGenerator {
	selector?: k8s.V1LabelSelector;
}

declare interface ConfigGenerator {
	kind: string;
	name: string;
}

declare interface ListGenerator {
	elements?: any[];
}

declare interface PullRequestGenerator {
	interval: any;
	driver: string;
	serverURL?: string;
	repo: string;
	secretRef?: LocalObjectReference;
	labels?: string[];
	forks?: boolean;
}

declare interface APIClientGenerator {
	interval: any;
	endpoint?: string;
	method?: string;
	jsonPath?: string;
	headersRef?: HeadersReference;
	body?: any;
	singleElement?: boolean;
	secretRef?: LocalObjectReference;
}

declare interface HeadersReference {
	kind: string;
	name: string;
}

declare interface RepositoryGeneratorFileItem {
	path: string;
}

declare interface RepositoryGeneratorDirectoryItem {
	path: string;
	exclude?: boolean;
}

declare interface GitRepositoryGenerator {
	repositoryRef?: string;
	files?: RepositoryGeneratorFileItem[];
	directories?: RepositoryGeneratorDirectoryItem[];
}

declare interface OCIRepositoryGenerator {
	repositoryRef?: string;
	files?: RepositoryGeneratorFileItem[];
	directories?: RepositoryGeneratorDirectoryItem[];
}

declare interface MatrixGenerator {
	generators?: GitOpsSetNestedGenerator[];
	singleElement?: boolean;
}

declare interface GitOpsSetNestedGenerator {
	name?: string;
	list?: ListGenerator;
	gitRepository?: GitRepositoryGenerator;
	ociRepository?: OCIRepositoryGenerator;
	pullRequests?: PullRequestGenerator;
	cluster?: ClusterGenerator;
	apiClient?: APIClientGenerator;
	imagePolicy?: ImagePolicyGenerator;
	config?: ConfigGenerator;
}

declare interface ImagePolicyGenerator {
	policyRef?: string;
}

declare interface GitOpsSetGenerator {
	list?: ListGenerator;
	pullRequests?: PullRequestGenerator;
	gitRepository?: GitRepositoryGenerator;
	ociRepository?: OCIRepositoryGenerator;
	matrix?: MatrixGenerator;
	cluster?: ClusterGenerator;
	apiClient?: APIClientGenerator;
	imagePolicy?: ImagePolicyGenerator;
	config?: ConfigGenerator;
}

declare interface GitOpsSetStatus {
	observedGeneration?: number;
	conditions?: Condition[];
	inventory?: ResourceInventory;
}


declare interface ResourceInventory {
	entries: ResourceRef[];
}

declare interface ResourceRef {
	// ID is the string representation of the Kubernetes resource object’s metadata,
	// in the format ‘namespace_name_group_kind’.
	id: string;
	// Version is the API version of the Kubernetes resource object’s kind.
	v: string;
}
