export interface KubernetesConfig {
	readonly apiVersion: string;
	readonly 'current-context': string;
	readonly clusters: ClusterType[] | undefined;
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

export interface ClusterType {
	readonly name: string;
	readonly cluster: {
		readonly server: string;
		readonly 'certificate-authority'?: string;
		readonly 'certificate-authority-data'?: string;
	};
}
