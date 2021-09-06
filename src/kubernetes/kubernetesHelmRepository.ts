import { ItemMetadata, ResourceMetadata } from './kubernetesGeneral';

export interface HelmRepository {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: HelmRepositoryItem[]
	readonly metadata: ItemMetadata;
}
export interface HelmRepositoryItem {
	readonly apiVersion: string;
	readonly kind: 'HelmRepository';
	readonly metadata: ResourceMetadata;
	// TODO: search for types
}
