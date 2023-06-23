import { FluxWorkload } from '../fluxCliTypes';
import { KubernetesObjectKinds } from '../../types/kubernetes/kubernetesTypes';
import { Bucket } from './bucket';
import { GitRepository } from './gitRepository';
import { HelmRelease } from './helmRelease';
import { HelmRepository } from './helmRepository';
import { Kustomize } from './kustomize';
import { OCIRepository } from './ociRepository';

export type FluxSourceObject = GitRepository | OCIRepository | HelmRepository | Bucket;
export type FluxWorkloadObject = Kustomize | HelmRelease;

export const FluxSourceKinds: string[] = [
	KubernetesObjectKinds.GitRepository,
	KubernetesObjectKinds.OCIRepository,
	KubernetesObjectKinds.HelmRepository,
	KubernetesObjectKinds.Bucket,
];


export function namespacedObject(resource?: FluxSourceObject | FluxWorkloadObject): string | undefined {
	if(resource) {
		return `${resource.kind}/${resource.metadata.name}.${resource.metadata.namespace}`;
	}
}
