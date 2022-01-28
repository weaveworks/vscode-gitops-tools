/**
 * Defines GitOps tree view node context values.
 */
export const enum NodeContext {

	// Cluster context values
	Cluster = 'cluster',
	CurrentCluster = 'currentCluster',
	NotCurrentCluster = 'notCurrentCluster',
	// Need both bc there's a time when it's not known whether it's enabled or not
	// and bc it's a string context with multiple contexts delimited by `;`, not boolean
	ClusterGitOpsEnabled = 'clusterGitOpsEnabled',
	ClusterGitOpsNotEnabled = 'clusterGitOpsNotEnabled',

	// Generic context values
	Suspend = 'suspend',
	NotSuspend = 'notSuspend',
}
