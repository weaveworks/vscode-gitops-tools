import { openConfigureGitOpsPanel } from '../webview-backend/configureGitOps/openPanel';

/**
 * Open ConfigureGitops webview with 'New Source' tab open
 */
export async function addSource() {
	openConfigureGitOpsPanel(false);
}
