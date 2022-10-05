import { openConfigureGitOpsPanel } from '../panels/configureGitOps';

/**
 * Open ConfigureGitops webview with 'New Source' tab open
 */
export async function addSource() {
	openConfigureGitOpsPanel(false);
}
