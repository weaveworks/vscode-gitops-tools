import { Condition, Kind, KubernetesObject, LocalObjectReference } from 'types/kubernetes/kubernetesTypes';

export interface Pipeline extends KubernetesObject {
	readonly kind: Kind.Pipeline;
	readonly spec: PipelineSpec;
	readonly status: PipelineStatus;
}

declare interface PipelineSpec {
	environments: Environment[];
	appRef: LocalAppReference;
	promotion?: Promotion;
}

declare interface Promotion {
	manual?: boolean;
	strategy: Strategy;
}

declare interface Strategy {
	pullRequest?: PullRequestPromotion;
	notification?: NotificationPromotion;
	secretRef?: LocalObjectReference;
}

declare interface PullRequestPromotion {
	type: GitProviderType;
	url: string;
	baseBranch: string;
	secretRef: LocalObjectReference;
}


export enum GitProviderType {
	Github = 'github',
	Gitlab = 'gitlab',
	BitBucketServer = 'bitbucket-server',
	AzureDevOps = 'azure-devops',
}

type NotificationPromotion = unknown;

declare interface PipelineStatus {
	observedGeneration?: number;
	conditions?: Condition[];
	environments: { [key: string]: EnvironmentStatus | undefined;};
}

declare interface EnvironmentStatus {
	waitingApproval?: WaitingApproval;
	targets?: TargetStatus[];
}

declare interface WaitingApproval {
	revision: string;
}

declare interface ClusterAppReference {
	clusterRef?: CrossNamespaceClusterReference;
}

declare interface TargetStatus {
	clusterAppRef: ClusterAppReference;
	ready: boolean;
	revision?: string;
	error?: string;
}

declare interface Environment {
	name: string;
	targets: Target[];
	promotion?: Promotion;
}

declare interface Target {
	namespace: string;
	clusterRef?: CrossNamespaceClusterReference;
}

declare interface LocalAppReference {
	apiVersion: string;
	kind: string;
	name: string;
}

declare interface CrossNamespaceClusterReference {
	apiVersion?: string;
	kind: string;
	name: string;
	namespace?: string;
}


export enum PipelineReasons {
	//  Reasons used by the original controller.
	// TargetClusterNotFoundReason signals a failure to locate a cluster resource on the management cluster.
	TargetClusterNotFoundReason = 'TargetClusterNotFound',
	// TargetClusterNotReadyReason signals that a cluster pointed to by a Pipeline is not ready.
	TargetClusterNotReadyReason = 'TargetClusterNotReady',
	// ReconciliationSucceededReason signals that a Pipeline has been successfully reconciled.
	ReconciliationSucceededReason = 'ReconciliationSucceeded',

	// Reasons used by the level-triggered controller.
	// TargetNotReadableReason signals that an app object pointed to by a Pipeline cannot be read, either because it is not found, or it's on a cluster that cannot be reached.
	TargetNotReadableReason = 'TargetNotReadable',
}



