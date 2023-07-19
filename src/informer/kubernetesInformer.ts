// kubectl auth can-i watch gitrepository
// kubectl auth can-i watch kustomizations --all-namespaces

import * as k8s from '@kubernetes/client-node';
import { getAPIParams } from 'cli/kubernetes/apiResources';
import { kubeProxyConfig } from 'cli/kubernetes/kubectlProxy';
import { GitRepository } from 'types/flux/gitRepository';
import { Kind, KubernetesListObject, KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { sourceDataProvider } from 'ui/treeviews/treeViews';


export let informer: k8s.Informer<GitRepository> & k8s.ObjectCache<GitRepository> | undefined;


export async function startFluxInformer() {
	// running already or no proxy
	if(informer || !kubeProxyConfig) {
		return;
	}


	informer = createInformer(Kind.GitRepository, kubeProxyConfig);
	if(!informer) {
		return;
	}
	try {
		console.log('informer starting...');
		await informer.start();
		console.log('informer started');
		informer.on('error', (err: any) => {
			console.error('informer error event', err);
			stopFluxInformer();
		});
	} catch (err) {
		stopFluxInformer();
	}

	if(!informer) {
		console.log('failed to start informer');
		return;
	}

	registerInformerEvents();
}


export function stopFluxInformer() {
	if(informer) {
		informer.stop();
		informer = undefined;
		console.log('informer stopped');
	}
}


// will start a self-healing informer for each resource type and namespaces
function createInformer(kind: Kind, kubeConfig: k8s.KubeConfig) {
	// const k8sCoreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
	// k8sCoreApi.listNamespace()

	const k8sCustomApi = kubeConfig.makeApiClient(k8s.CustomObjectsApi);

	const api = getAPIParams(kind);
	if(!api) {
		return;
	}

	const listFn = async () => {
		const result = await k8sCustomApi.listClusterCustomObject(api.group, api.version, api.plural);
		const kbody = result.body as KubernetesListObject<GitRepository>;
		return Promise.resolve({response: result.response, body: kbody});
	};

	const k8sinformer = k8s.makeInformer(
		kubeConfig,
		`/apis/${api.group}/${api.version}/${api.plural}`,
		listFn,
	);

	return k8sinformer;
}

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



