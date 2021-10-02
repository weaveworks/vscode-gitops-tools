/**
 * Defines GitOps tree view node context values.
 */
export const enum NodeContext {

	// Cluster context values
	Cluster = 'cluster',
	ClusterFlux = 'clusterFlux',
	Deployment = 'deployment',

	// Source context values
	GitRepository = 'gitRepository',
	HelmRepository = 'helmRepository',
	Bucket = 'bucket',

	// Application context values
	Kustomization = 'kustomization',
	HelmRelease = 'helmRelease',

	// Documentation link context values
	DocumentationLink = 'documentationLink',
}
