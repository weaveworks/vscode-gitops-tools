import { Conditions, ItemMetadata, ResourceMetadata } from './kubernetesGeneral';

export interface GitRepository {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: GitRepositoryItem[];
	readonly metadata: ItemMetadata;
}
export interface GitRepositoryItem {
	readonly apiVersion: string;
	readonly kind: 'GitRepository';
	readonly metadata: ResourceMetadata;
	readonly spec: {
		readonly gitImplementation: string;
		readonly interval: string;
		readonly ref: {
			branch: string;
		}
		readonly timeout: string;
		readonly url: string;
	}
	readonly status: {
		readonly artifact: {
			readonly checksum: string;
			readonly lastUpdateTime: string;
			readonly path: string;
			readonly revision: string;
			readonly url: string;
		}
		readonly conditions: Conditions;
		readonly observedGeneration: number;
	}
}
