import { Uri } from 'vscode';
import { KubernetesFileSchemes } from 'types/kubernetes/kubernetesFileSchemes';

/**
 * Gets resource Uri for loading kubernetes resource config in vscode editor.
 *
 * @see https://github.com/Azure/vscode-kubernetes-tools/blob/master/src/kuberesources.virtualfs.ts
 *
 * @param namespace Resource namespace.
 * @param resourceName Resource name.
 * @param documentFormat Resource document format.
 * @param action Resource Uri action.
 * @returns
 */

export function getResourceUri(
	namespace: string | null | undefined,
	resourceName: string | undefined,
	documentFormat: string,
	action?: string,
): Uri {

	// determine resource file extension
	let fileExtension = '';
	if (documentFormat !== '') {
		fileExtension = `.${documentFormat}`;
	}

	// create virtual document file name with extension
	const documentName = `${resourceName?.replace('/', '-')}${fileExtension}`;

	// determine virtual resource file scheme
	let scheme = KubernetesFileSchemes.Resource;
	if (action === 'describe') {
		scheme = KubernetesFileSchemes.ReadonlyResource;
	}

	// determine virtual resource file authority
	let authority: string = KubernetesFileSchemes.KubectlResource;
	if (action === 'describe') {
		authority = KubernetesFileSchemes.DescribeResource;
	}

	// set namespace query param
	let namespaceQuery = '';
	if (namespace) {
		namespaceQuery = `ns=${namespace}&`;
	}

	// create resource url
	const nonce: number = new Date().getTime();
	const url = `${scheme}://${authority}/${documentName}?${namespaceQuery}value=${resourceName}&_=${nonce}`;

	// create resource uri
	return Uri.parse(url);
}
