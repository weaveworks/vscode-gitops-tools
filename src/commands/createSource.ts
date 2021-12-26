import { getExtensionContext } from '../extensionContext';
import { CreateSourcePanel } from '../webviews/createSourceWebview';

/**
 * Open the webview editor with a form to enter
 * all the flags needed to create the source
 * (and possibly Kustomization if the current
 * cluster is Azure)
 */
export async function createSource() {
	CreateSourcePanel.createOrShow(getExtensionContext().extensionUri);
}
