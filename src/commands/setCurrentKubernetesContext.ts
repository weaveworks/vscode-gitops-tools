import { setCurrentContext } from 'cli/kubernetes/kubernetesConfig';
import { ClusterContextNode } from 'ui/treeviews/nodes/clusterContextNode';
import { refreshAllTreeViews } from 'ui/treeviews/treeViews';

/**
 * Sets Kubernetes context and refreshes tree views if needed.
 */
export async function setCurrentKubernetesContext(clusterContext: ClusterContextNode): Promise<void> {
	const setContextResult = await setCurrentContext(clusterContext.contextName);
	if (setContextResult?.isChanged) {
		refreshAllTreeViews();
	}
}
