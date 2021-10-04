import { V1Node } from '@kubernetes/client-node';
import { KubernetesObjectKinds, ResultMetadata } from './kubernetesTypes';

//TODO: merge with `namespace.ts` file or make a generic type?

/**
 * Node info object.
 */
export type Node = Required<V1Node> & {
	readonly kind: KubernetesObjectKinds.Node;
};

/**
 * Node results from running
 * `get node` command.
 */
export interface NodeResult {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: Node[];
	readonly metadata: ResultMetadata;
}
