// kubectl auth can-i watch gitrepository
// kubectl auth can-i watch kustomizations --all-namespaces

import * as k8s from '@kubernetes/client-node';
import { getAPIParams } from 'cli/kubernetes/apiResources';
import { GitRepository } from 'types/flux/gitRepository';
import { Kind, KubernetesListObject, KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { sourceDataProvider } from 'ui/treeviews/treeViews';


export let informer: k8s.Informer<GitRepository> & k8s.ObjectCache<GitRepository> | undefined;



// export async function startFluxInformer() {
// 	return;
// // running already or no proxy
// if(informer || !kubeProxyConfig) {
// 	return;
// }


// informer = createInformer(Kind.GitRepository, kubeProxyConfig);
// if(!informer) {
// 	return;
// }
// try {
// 	console.log('informer starting...');
// 	await informer.start();
// 	console.log('informer started');
// 	informer.on('error', (err: any) => {
// 		console.error('informer error event', err);
// 		stopFluxInformer();
// 	});
// } catch (err) {
// 	stopFluxInformer();
// }

// if(!informer) {
// 	console.log('failed to start informer');
// 	return;
// }

// registerInformerEvents();
// }


// export function stopFluxInformer() {
// return;
// if(informer) {
// 	informer.stop();
// 	informer = undefined;
// 	console.log('informer stopped');
// }
// }

let k8sCoreApi: k8s.CoreV1Api | undefined;
let k8sCustomApi: k8s.CustomObjectsApi | undefined;
let k8sWatch: k8s.Watch | undefined;

export function createK8sClients(kc: k8s.KubeConfig) {
	k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
	k8sWatch = new k8s.Watch(kc);
	k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);
}

export function destroyK8sClients() {
	k8sCoreApi = undefined;
	k8sWatch = undefined;
	k8sCustomApi = undefined;
}


export async function k8sList(kind: Kind): Promise<GitRepository[] | undefined> {
	const api = getAPIParams(kind);
	if(!api) {
		console.log('k8sList no apiParams');

		return;
	}
	if(!k8sCustomApi) {
		console.log('k8sList no k8sCustomApi');
		return;
	}

	const result = await k8sCustomApi.listClusterCustomObject(api.group, api.version, api.plural);
	const kbody = result.body as KubernetesListObject<GitRepository>;

	return kbody.items;
}



// will start a self-healing informer for each resource type and namespaces
// function createInformer(kind: Kind, kubeConfig: k8s.KubeConfig) {
// 	// const k8sCoreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
// 	// k8sCoreApi.listNamespace()

// 	const k8sCustomApi = kubeConfig.makeApiClient(k8s.CustomObjectsApi);

// 	const api = getAPIParams(kind);
// 	if(!api) {
// 		return;
// 	}

// 	const listFn = async () => {
// 		const result = await k8sCustomApi.listClusterCustomObject(api.group, api.version, api.plural);
// 		const kbody = result.body as KubernetesListObject<GitRepository>;
// 		return Promise.resolve({response: result.response, body: kbody});
// 	};

// 	const k8sinformer = k8s.makeInformer(
// 		kubeConfig,
// 		`/apis/${api.group}/${api.version}/${api.plural}`,
// 		listFn,
// 	);

// 	return k8sinformer;
// }

function registerInformerEvents() {
	informer?.on('add', (obj: KubernetesObject) => {
		// console.log('informer add event', obj);
		sourceDataProvider.add(obj);
	});

	informer?.on('update', (obj: KubernetesObject) => {
		// console.log('informer update event', obj);
		sourceDataProvider.update(obj);
	});

	informer?.on('delete', (obj: KubernetesObject) => {
		// console.log('informer delete event', obj);
		sourceDataProvider.delete(obj);
	});
	console.log('informer listening for events...');

}



