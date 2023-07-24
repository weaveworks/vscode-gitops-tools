/**
 * Cluster providers will have some differences.
 * For example, AKS cluster has special handling
 * for enabling GitOps.
 */

export const enum ClusterProvider {
	/**
	 * Azure Kubernetes Service.
	 */
	AKS = 'AKS',
	/**
	 * Cluster managed by Azure Arc.
	 */
	AzureARC = 'Azure Arc',
	/**
	 * Any cluster that is not AKS and not Azure Arc is
	 * considered generic at this point.
	 */
	Generic = 'Generic',
	/**
	 * Not loaded yet.
	 */
	Unknown = 'Unknown',
	/**
	 * Error occurred when trying to determine the cluster provider
	 */
	DetectionFailed = 'DetectionFailed',
}

export type KnownClusterProviders = Exclude<Exclude<ClusterProvider, ClusterProvider.Unknown>, ClusterProvider.DetectionFailed>;
export const knownClusterProviders: KnownClusterProviders[] = [
	ClusterProvider.AKS,
	ClusterProvider.AzureARC,
	ClusterProvider.Generic,
];

export interface ClusterInfo {
	clusterProvider: ClusterProvider;
	isClusterProviderUserOverride: boolean;
	isAzure: boolean;
}
