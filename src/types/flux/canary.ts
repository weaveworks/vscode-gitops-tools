import { Condition, Kind, KubernetesObject } from 'types/kubernetes/kubernetesTypes';



export interface Canary extends KubernetesObject {
	readonly kind: Kind.Canary;

	readonly spec: CanarySpec;

	readonly status?: CanaryStatus;
}

type CanarySpec = any;

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

