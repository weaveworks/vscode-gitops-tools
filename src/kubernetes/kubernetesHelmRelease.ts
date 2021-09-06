import { ItemMetadata, ResourceMetadata } from './kubernetesGeneral';

export interface HelmRelease {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: HelmReleaseItem[];
	readonly metadata: ItemMetadata;
}
export interface HelmReleaseItem {
	readonly apiVersion: string;
	readonly kind: "HelmRelease",
	readonly metadata: ResourceMetadata;
	// TODO: fill
}
