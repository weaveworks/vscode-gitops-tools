/**
 * Kubernetes config result from
 * running `kubectl config view` command.
 */
export interface KubernetesConfig {
	readonly apiVersion: string;
	readonly 'current-context': string;
	readonly clusters: Cluster[] | undefined;
	readonly contexts: {
		readonly name: string;
		readonly context: {
			readonly cluster: string;
			readonly user: string;
			readonly namespace?: string;
		};
	}[] | undefined;
	readonly users: {
		readonly name: string;
		readonly user: Record<string, unknown>;
	}[] | undefined;
}

/**
 * Cluster info from `kubectl config view`.
 */
export interface Cluster {
	readonly name: string;
	readonly cluster: {
		readonly server: string;
		readonly 'certificate-authority'?: string;
		readonly 'certificate-authority-data'?: string;
	};
}
