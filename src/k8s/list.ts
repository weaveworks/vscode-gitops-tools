import { getAPIParams } from 'cli/kubernetes/apiResources';
import { FluxObject } from 'types/flux/object';
import { Kind, KubernetesListObject, Namespace } from 'types/kubernetes/kubernetesTypes';
import { k8sCoreApi, k8sCustomApi } from './client';

export async function k8sList<T extends FluxObject>(kind: Kind): Promise<T[] | undefined> {
	const api = getAPIParams(kind);
	if(!api) {
		console.log('k8sList no apiParams');
		return;
	}

	if(!k8sCustomApi) {
		console.log('k8sList no k8sCustomApi');
		return;
	}

	try	{
		const result = await k8sCustomApi.listClusterCustomObject(api.group, api.version, api.plural);
		const kbody = result.body as KubernetesListObject<T>;
		return kbody.items;
	} catch (error) {
		return;
	}
}

export async function k8sListNamespaces(): Promise<Namespace[] | undefined> {
	if(!k8sCoreApi) {
		console.log('k8sList no k8sCustomApi');
		return;
	}

	try	{
		const t1 = Date.now();
		const result = await k8sCoreApi.listNamespace();
		console.log('k8sList Namespace ∆', Date.now() - t1);

		const kbody = result.body as KubernetesListObject<Namespace>;
		return kbody.items.map(ns => {
			// for some reason listNamespace kind is undefined
			(ns as any).kind = 'Namespace';
			return ns;
		});
	} catch (error) {
		return;
	}
}
