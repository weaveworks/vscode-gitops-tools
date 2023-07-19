import { Kind } from 'types/kubernetes/kubernetesTypes';
import { Bucket } from './bucket';
import { GitRepository } from './gitRepository';
import { HelmRelease } from './helmRelease';
import { HelmRepository } from './helmRepository';
import { Kustomization } from './kustomization';
import { OCIRepository } from './ociRepository';

export type FluxSourceObject = GitRepository | OCIRepository | HelmRepository | Bucket;
export type FluxWorkloadObject = Kustomization | HelmRelease;
export type FluxObject = FluxSourceObject | FluxWorkloadObject;

export const FluxSourceKinds: string[] = [
	Kind.GitRepository,
	Kind.OCIRepository,
	Kind.HelmRepository,
	Kind.Bucket,
];

