import { FluxSourceObject, FluxWorkloadObject } from '../types/flux/object';



export function namespacedFluxObject(resource?: FluxSourceObject | FluxWorkloadObject): string | undefined {
	if (resource) {
		return `${resource.kind}/${resource.metadata?.name}.${resource.metadata?.namespace}`;
	}
}
