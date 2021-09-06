import { Conditions, ItemMetadata, ResourceMetadata } from './kubernetesGeneral';

export interface Kustomize {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: KustomizeItem[];
	readonly metadata: ItemMetadata;
}
export interface KustomizeItem {
	readonly apiVersion: string;
	readonly kind: 'Kustomization'
	readonly metadata: ResourceMetadata;
	readonly spec: {
		readonly force: boolean;
		readonly interval: string;
		readonly path: string;
		readonly prune: boolean;
		readonly sourceRef: {
			readonly kind: string;
			readonly name: string;
		}
	}
	readonly status: {
		readonly conditions: Conditions;
		readonly lastAppliedRevision: string;
		readonly lastAttemptedRevision: string;
		readonly observedGeneration: number;
		readonly snapshot: {
			readonly checksum: string;
			readonly entries: {
				readonly kinds: {
					[key: string]: string;
				}
			}[]
		}
	}
}
