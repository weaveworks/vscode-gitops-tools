
export type FluxSource = 'source git' | 'source oci' | 'source helm' | 'source bucket';
export type FluxWorkload = 'helmrelease' | 'kustomization' | 'terraform';

/**
 * Object resulting from running `flux tree`.
 */
export interface FluxTreeResources {
	resource: {
		Namespace: string;
		Name: string;
		GroupKind: {
			Group: string;
			Kind: string;
		};
	};
	resources?: FluxTreeResources[];
}
