/**
 * Defines GitOps tree view node context values.
 */
export const enum NodeContext {

	// Cluster context values
	Cluster = 'cluster',
	ClusterGitOpsEnabled = 'clusterGitOpsEnabled',
	ClusterGitOpsNotEnabled = 'clusterGitOpsNotEnabled',
	ClusterProviderAKS = 'clusterProviderAKS',
	ClusterProviderGeneric = 'clusterProviderGeneric',
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
