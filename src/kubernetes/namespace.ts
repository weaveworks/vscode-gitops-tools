import { V1Namespace } from '@kubernetes/client-node';
import { KubernetesObjectKinds, ResultMetadata } from './kubernetesTypes';

/**
 * Namespace info object.
 */
export type Namespace = Required<V1Namespace> & {
	readonly kind: KubernetesObjectKinds.Namespace;
};

/**
 * Namespace results from running
 * `get namespace` command.
 */
export interface NamespaceResult {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: Namespace[];
	readonly metadata: ResultMetadata;
}
