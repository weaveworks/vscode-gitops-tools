import { V1Pod } from '@kubernetes/client-node';
import { KubernetesObjectKinds, ResultMetadata } from './kubernetesTypes';

/**
 * Pod info object.
 */
export type Pod = Required<V1Pod> & {
	readonly kind: KubernetesObjectKinds.Pod;
};

/**
 * Pod results from running
 * `get pod` command.
 */
export interface PodResult {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: Pod[];
	readonly metadata: ResultMetadata;
}
