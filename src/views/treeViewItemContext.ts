
/**
 * GitOps tree view item context values.
 */
 export const enum NodeContext {
	// Cluster tree view
	Cluster = 'cluster',
	ClusterFlux = 'clusterFlux',
	Deployment = 'deployment',
	// Sources tree view
	GitRepository = 'gitRepository',
	HelmRepository = 'helmRepository',
	Bucket = 'bucket',
	// Applications tree view
	Kustomization = 'kustomization',
	HelmRelease = 'helmRelease',
	// Documentation tree view
	DocumentationLink = 'documentationLink',
}
