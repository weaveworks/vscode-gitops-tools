import { openConfigureGitOpsWebview } from '../webview-backend/configureGitOps/openWebview';

/**
 * Open ConfigureGitops webview with 'New Source' tab open
 */
export async function addSource() {
	openConfigureGitOpsWebview(false);
}
