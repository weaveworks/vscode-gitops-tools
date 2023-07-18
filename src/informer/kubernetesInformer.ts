// kubectl auth can-i watch gitrepository
// kubectl auth can-i watch kustomizations --all-namespaces
// kubectl api-resources -o wide
//  experiment how the fallbacks work by default if watch is disabled

// flux v 0.42: /apis/source.toolkit.fluxcd.io/v1beta2/gitrepositories
// flux prerelease: /apis/source.toolkit.fluxcd.io/v1/gitrepositories

import * as k8s from '@kubernetes/client-node';
import { kubeProxyConfig } from 'cli/kubernetes/kubectlProxy';
import { GitRepository } from 'types/flux/gitRepository';
import { Kind, KubernetesListObject, KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { sourceDataProvider } from 'ui/treeviews/treeViews';
// import { createKubeProxyConfig } from './createKubeProxyConfig';
// import { initKubeConfigWatcher } from '../cli/kubernetes/kubernetesConfigWatcher';



type KindPlural = string;
type ApiGroup = string;
type ApiVersion = string;
type ApiEndpointParams = [KindPlural, ApiGroup, ApiVersion];

type InformerEventType = 'add' | 'update' | 'delete';
type InformerEventFunc = (event: InformerEventType, obj: KubernetesObject)=> void;

// TODO: lookup real paths
// TODO: loop for all Kind types to automate this

function getAPIPaths(kind: Kind): ApiEndpointParams {
	const paths: Record<Kind, ApiEndpointParams> = {
		'GitRepository': ['gitrepositories', 'source.toolkit.fluxcd.io', 'v1'],
	} as Record<Kind, ApiEndpointParams>;

	return paths[kind];
}


// registering an add function before informer start will fire for each existing object
// registering after the start wont fire for old objects
// autonomous is somehow simpler in this case


export let informer: k8s.Informer<GitRepository> & k8s.ObjectCache<GitRepository> | undefined;


export async function startFluxInformer() {
	// running already or no proxy
	if(informer || !kubeProxyConfig) {
		return;
	}


	informer = createInformer(Kind.GitRepository, kubeProxyConfig);

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
	}
	console.log('informer stopped');
}


// will start a self-healing informer for each resource type and namespaces
function createInformer(kind: Kind, kubeConfig: k8s.KubeConfig) {
	// const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
	const k8sCustomApi = kubeConfig.makeApiClient(k8s.CustomObjectsApi);

	const [plural, group, version] = getAPIPaths(kind);

	const listFn = async () => {
		const result = await k8sCustomApi.listClusterCustomObject(group, version, plural);
		const kbody = result.body as KubernetesListObject<GitRepository>;
		return Promise.resolve({response: result.response, body: kbody});
	};

	const k8sinformer = k8s.makeInformer(
		kubeConfig,
		`/apis/${group}/${version}/${plural}`,
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



