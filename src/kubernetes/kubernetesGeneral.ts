export interface ResourceMetadata {
	readonly annotations: {
		'kubectl.kubernetes.io/last-applied-configuration': string;
	};
	readonly creationTimestamp: string;
	readonly finalizers: string[];
	readonly generation: number;
	readonly name: string;
	readonly namespace: string;
	readonly resourceVersion: string;
	readonly uid: string;
}

export interface ItemMetadata {
	readonly resourceVersion: '';
	readonly selfLink: '';
}

export type Conditions = {
	readonly lastTransitionTime: string;
	readonly message: string;
	readonly reason: string;
	readonly status: string;
	readonly type: string;
}[];
