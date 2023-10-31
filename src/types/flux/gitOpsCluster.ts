import { Kind, KubernetesObject } from 'types/kubernetes/kubernetesTypes';

export interface GitOpsCluster extends KubernetesObject {
	readonly kind: Kind.GitOpsCluster;
	readonly spec: GitOpsClusterSpec;
	readonly status: GitOpsClusterStatus;
}

export type GitOpsClusterSpec = any;
export type GitOpsClusterStatus = any;



