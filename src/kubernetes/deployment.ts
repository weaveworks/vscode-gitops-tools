import { V1Deployment } from '@kubernetes/client-node';
import { KubernetesObjectKinds, ResultMetadata } from './kubernetesTypes';

/**
 * Deployment info object.
 */
export type Deployment = Required<V1Deployment> & {
	readonly kind: KubernetesObjectKinds.Deployment;
};

/**
 * Deployment results from running
 * `get deployment` command.
 */
export interface DeploymentResult {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: Deployment[];
	readonly metadata: ResultMetadata;
}
