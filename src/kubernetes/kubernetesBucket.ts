import { ItemMetadata, ResourceMetadata } from './kubernetesGeneral';

// TODO: Perhaps type can be found at https://fluxcd.io/docs/components/source/buckets/
export interface Bucket {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: BucketItem[];
	readonly metadata: ItemMetadata;
}
export interface BucketItem {
	readonly apiVersion: string;
	readonly kind: 'Bucket';
	readonly metadata: ResourceMetadata;
	readonly spec: {
		readonly bucketName: string;
		readonly endpoint: string;
		readonly interval: string;
		readonly insecure?: boolean;
		readonly provider?: string;
		readonly timeout?: string;
	}
	readonly status: unknown;
}
