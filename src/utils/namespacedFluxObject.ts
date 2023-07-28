import { FluxSourceObject, FluxWorkloadObject } from '../types/flux/object';

export function namespacedFluxObject(resource?: FluxSourceObject | FluxWorkloadObject): string | undefined {
	if (resource) {
		return `${resource.kind}/${resource.metadata?.name}.${resource.metadata?.namespace}`;
	}
}

export function splitNamespacedFluxObject(fullname: string) {
	const [kind, nameNs] = fullname.split('/');
	const [name, namespace] = nameNs.split('.');
	return { kind, name, namespace };
}
