type KubernetesObject = { kind: any; metadata: { name: any; namespace: any; }; };

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}


export function namespacedSource(s: KubernetesObject): string {
	return `${s.kind}/${s.metadata.name}.${s.metadata.namespace}`;
}
