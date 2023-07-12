import { loadKubeConfig, setCurrentContext } from 'cli/kubernetes/kubernetesConfig';
import { ClusterNode } from 'ui/treeviews/nodes/cluster/clusterNode';
import { refreshAllTreeViews } from 'ui/treeviews/treeViews';

/**
 * Sets Kubernetes context and refreshes tree views if needed.
 */
export async function setCurrentKubernetesContext(clusterContext: ClusterNode): Promise<void> {
	const setContextResult = await setCurrentContext(clusterContext.contextName);
	if (setContextResult?.isChanged) {
		loadKubeConfig();
		refreshAllTreeViews();
	}
}
