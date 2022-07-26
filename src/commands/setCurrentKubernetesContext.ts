import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ClusterContextNode } from '../views/nodes/clusterContextNode';
import { refreshAllTreeViews } from '../views/treeViews';

/**
 * Sets Kubernetes context and refreshes tree views if needed.
 */
export async function setCurrentKubernetesContext(clusterContext: ClusterContextNode): Promise<void> {
	const setContextResult = await kubernetesTools.setCurrentContext(clusterContext.contextName);
	if (setContextResult?.isChanged) {
		refreshAllTreeViews();
	}
}
