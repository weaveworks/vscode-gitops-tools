/**
 * Kubernetes config result from
 * running `kubectl config view` command.
 */
export interface KubernetesConfig {
	readonly apiVersion: string;
	readonly 'current-context': string;
	readonly clusters: KubernetesCluster[] | undefined;
	readonly contexts: KubernetesContext[] | undefined;
	readonly users: {
		readonly name: string;
		readonly user: Record<string, unknown>;
	}[] | undefined;
}

/**
 * Cluster info object.
 */
export interface KubernetesCluster {
	readonly name: string;
	readonly server: string;
	readonly 'certificate-authority'?: string;
	readonly 'certificate-authority-data'?: string;
}

/**
 * Context info object.
 */
export interface KubernetesContext {
	readonly name: string;
	isCurrentContext?: boolean;
	readonly context: {
		readonly cluster: string;
		readonly user: string;
		readonly namespace?: string;
	};
}

/**
 * Kubernetes context but with cluster object inside it.
 */
export type KubernetesContextWithCluster = KubernetesContext & {
	context: {
		clusterInfo?: KubernetesCluster;
	};
};
