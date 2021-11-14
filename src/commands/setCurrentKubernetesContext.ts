import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { refreshAllTreeViews } from '../views/treeViews';

/**
 * Sets Kubernetes context and refreshes tree views if needed.
 * @param contextName target kubernetes context name.
 */
export async function setCurrentKubernetesContext(contextName: string): Promise<void> {
	const setContextResult = await kubernetesTools.setCurrentContext(contextName);
	if (setContextResult?.isChanged) {
		refreshAllTreeViews();
	}
}
