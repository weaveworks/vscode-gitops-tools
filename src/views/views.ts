/**
 * GitOps views.
 */
export const enum Views {
	ClusterView = 'gitops.views.clusters',
	SourceView = 'gitops.views.sources',
	DeploymentView = 'gitops.views.deployments',
	DocumentationView = 'gitops.views.documentation',
}

/**
 * GitOps tree view item context values.
 */
export const enum TreeViewItemContext {
	Cluster = 'cluster',
	Kustomization = 'kustomization',
	HelmRelease = 'helmRelease',
	HelmRepository = 'helmRepository',
	GitRepository = 'gitRepository',
	Bucket = 'bucket',
	DocumentationLink = 'documentationLink',
}
