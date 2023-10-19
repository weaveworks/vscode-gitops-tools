import { Condition, Kind, KubernetesObject } from 'types/kubernetes/kubernetesTypes';

export interface Canary extends KubernetesObject {
	readonly kind: Kind.Canary;
	readonly spec: CanarySpec;
	readonly status: CanaryStatus;
}

declare interface CanarySpec {
	provider?: string;
	metricsServer?: string;
	targetRef: LocalObjectReference;
	autoscalerRef?: AutoscalerRefernce;
	ingressRef?: LocalObjectReference;
	routeRef?: LocalObjectReference;
	upstreamRef?: CrossNamespaceObjectReference;
	service: CanaryService;
	analysis?: CanaryAnalysis;
	canaryAnalysis?: CanaryAnalysis;
	progressDeadlineSeconds?: number;
	skipAnalysis?: boolean;
	revertOnDeletion?: boolean;
	suspend?: boolean;
}

declare interface CanaryService {
	name?: string;
	port: number;
	portName?: string;
	targetPort?: number | string;
	appProtocol?: string;
	portDiscovery: boolean;
	timeout?: string;
	gateways?: string[];
	gatewayRefs?: any[];
	hosts?: string[];
	delegation?: boolean;
	trafficPolicy?: any;
	match?: any;
	rewrite?: any;
	retries?: any;
	headers?: any;
	mirror?: any[];
	corsPolicy?: any;
	meshName?: string;
	backends?: string[];
	apex?: CustomMetadata;
	primary?: CustomMetadata;
	canary?: CustomMetadata;
}

declare interface CanaryAnalysis {
	interval: string;
	iterations?: number;
	mirror?: boolean;
	mirrorWeight?: number;
	maxWeight?: number;
	stepWeight?: number;
	stepWeights?: number[];
	stepWeightPromotion?: number;
	threshold: number;
	primaryReadyThreshold?: number;
	canaryReadyThreshold?: number;
	alerts?: CanaryAlert[];
	metrics?: CanaryMetric[];
	webhooks?: CanaryWebhook[];
	match?: any[];
	sessionAffinity?: SessionAffinity;
}

declare interface SessionAffinity {
	cookieName?: string;
	maxAge?: number;
}

declare interface CanaryMetric {
	name: string;
	interval?: string;
	threshold?: number;
	thresholdRange?: CanaryThresholdRange;
	query?: string;
	templateRef?: CrossNamespaceObjectReference;
	templateVariables?: { [key: string]: string;};
}

declare interface CanaryThresholdRange {
	min?: number;
	max?: number;
}

declare interface CanaryAlert {
	name: string;
	severity?: AlertSeverity;
	providerRef: CrossNamespaceObjectReference;
}

declare interface CanaryWebhook {
	type: HookType;
	name: string;
	url: string;
	muteAlert: boolean;
	timeout?: string;
	metadata?: { [key: string]: string;};
}

declare interface CanaryWebhookPayload {
	name: string;
	namespace: string;
	phase: CanaryPhase;
	checksum: string;
	metadata?: { [key: string]: string;};
}

declare interface CrossNamespaceObjectReference {
	apiVersion?: string;
	kind?: string;
	name: string;
	namespace?: string;
}

declare interface LocalObjectReference {
	apiVersion?: string;
	kind?: string;
	name: string;
}

declare interface AutoscalerRefernce {
	apiVersion?: string;
	kind?: string;
	name: string;
	primaryScalerQueries: { [key: string]: string;};
	primaryScalerReplicas?: ScalerReplicas;
}

declare interface ScalerReplicas {
	minReplicas?: number;
	maxReplicas?: number;
}

declare interface CustomMetadata {
	labels?: { [key: string]: string;};
	annotations?: { [key: string]: string;};
}

declare interface HTTPRewrite {
	uri?: string;
	authority?: string;
	type?: string;
}

// CanaryStatus is used for state persistence (read-only)
interface CanaryStatus {
	phase: CanaryPhase;
	failedChecks: number;
	canaryWeight: number;
	iterations: number;

	previousSessionAffinityCookie?: string;
	sessionAffinityCookie?: string;
	trackedConfigs?: any;

	lastAppliedSpec?: string;
	lastPromotedSpec?: string;
	lastTransitionTime: string;
	conditions?: CanaryCondition[];
}

export type CanaryCondition = Required<Condition> & {
	// Type of this condition
	type: 'Promoted';
};


export const enum CanaryPhase {
	// Initializing means the canary initializing is underway
	Initializing = 'Initializing',
	// Initialized means the primary deployment, hpa and ClusterIP services
	// have been created along with the service mesh or ingress objects
	Initialized = 'Initialized',
	// Waiting means the canary rollout is paused (waiting for confirmation to proceed)
	Waiting = 'Waiting',
	// Progressing means the canary analysis is underway
	Progressing = 'Progressing',
	// WaitingPromotion means the canary promotion is paused (waiting for confirmation to proceed)
	WaitingPromotion = 'WaitingPromotion',
	// Promoting means the canary analysis is finished and the primary spec has been updated
	Promoting = 'Promoting',
	// Finalising means the canary promotion is finished and traffic has been routed back to primary
	Finalising = 'Finalising',
	// Succeeded means the canary analysis has been successful
	// and the canary deployment has been promoted
	Succeeded = 'Succeeded',
	// Failed means the canary analysis failed
	// and the canary deployment has been scaled to zero
	Failed = 'Failed',
	// Terminating means the canary has been marked
	// for deletion and in the finalizing state
	Terminating = 'Terminating',
	// Terminated means the canary has been finalized
	// and successfully deleted
	Terminated = 'Terminated',
}


// // HookType can be pre, post or during rollout
export enum HookType {
	// RolloutHook execute webhook during the canary analysis
	RolloutHook = 'rollout',
	// PreRolloutHook execute webhook before routing traffic to canary
	PreRolloutHook = 'pre-rollout',
	// PostRolloutHook execute webhook after the canary analysis
	PostRolloutHook = 'post-rollout',
	// ConfirmRolloutHook halt canary analysis until webhook returns HTTP 200
	ConfirmRolloutHook = 'confirm-rollout',
	// ConfirmPromotionHook halt canary promotion until webhook returns HTTP 200
	ConfirmPromotionHook = 'confirm-promotion',
	// EventHook dispatches Flagger events to the specified endpoint
	EventHook = 'event',
	// RollbackHook rollback canary analysis if webhook returns HTTP 200
	RollbackHook = 'rollback',
	// ConfirmTrafficIncreaseHook increases traffic weight if webhook returns HTTP 200
	ConfirmTrafficIncreaseHook = 'confirm-traffic-increase',
}


export enum AlertSeverity {
	SeverityInfo = 'info',
	SeverityWarn = 'warn',
	SeverityError = 'error',
}

