import { Kind } from 'types/kubernetes/kubernetesTypes';
import { Bucket } from './bucket';
import { Canary } from './canary';
import { GitRepository } from './gitRepository';
import { GitOpsSet } from './gitopsset';
import { HelmRelease } from './helmRelease';
import { HelmRepository } from './helmRepository';
import { Kustomization } from './kustomization';
import { OCIRepository } from './ociRepository';
import { Pipeline } from './pipeline';

export type FluxSourceObject = GitRepository | OCIRepository | HelmRepository | Bucket;
export type FluxWorkloadObject = Kustomization | HelmRelease;
export type ToolkitObject = FluxSourceObject | FluxWorkloadObject | GitOpsSet | Pipeline | Canary;

export const FluxSourceKinds: Kind[] = [
	Kind.GitRepository,
	Kind.OCIRepository,
	Kind.HelmRepository,
	Kind.Bucket,
];

export const FluxWorkloadKinds: Kind[] = [
	Kind.Kustomization,
	Kind.HelmRelease,
	Kind.Canary,
];

