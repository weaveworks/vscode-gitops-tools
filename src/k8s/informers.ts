import * as k8s from '@kubernetes/client-node';
import { getAPIParams } from 'cli/kubernetes/apiResources';
import { GitRepository } from 'types/flux/gitRepository';
import { Kind, KubernetesListObject, KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { KubernetesObjectDataProvider } from 'ui/treeviews/dataProviders/kubernetesObjectDataProvider';
import { sourceDataProvider, workloadDataProvider } from 'ui/treeviews/treeViews';
import { k8sCustomApi } from './client';
import { FluxSourceKinds, FluxWorkloadKinds } from 'types/flux/object';


let informers: k8s.Informer<KubernetesObject>[] = [];

export function createInformers(kc: k8s.KubeConfig) {
	FluxSourceKinds.forEach(kind => {
		createInformer(kc, sourceDataProvider, kind);
	});

	FluxWorkloadKinds.forEach(kind => {
		createInformer(kc, workloadDataProvider, kind);
	});
}

export function destroyInformers() {
	informers.forEach(informer => {
		informer.stop();
	});

	informers = [];
}


async function createInformer(kc: k8s.KubeConfig, receiver: KubernetesObjectDataProvider, kind: Kind) {
	const api = getAPIParams(kind);
	if (!api) {
		return;
	}

	const listFn = async () => {
		const result = await k8sCustomApi!.listClusterCustomObject(api.group, api.version, api.plural);
		const kbody = result.body as KubernetesListObject<GitRepository>;
		return Promise.resolve({ response: result.response, body: kbody });
	};

	const informer = k8s.makeInformer(
		kc,
		`/apis/${api.group}/${api.version}/${api.plural}`,
		listFn,
	);

	try {
		await informer.start();
		registerInformerEvents(informer, receiver);
		informers.push(informer);
	} catch (error) {
		destroyInformers();
	}
}

function registerInformerEvents(informer: k8s.Informer<KubernetesObject>, receiver: KubernetesObjectDataProvider) {
	informer?.on('add', (obj: KubernetesObject) => {
		// console.log('*- informer Add', obj);
		receiver.add(obj);
	});

	informer?.on('update', (obj: KubernetesObject) => {
		// console.log('*- informer Update', obj);
		receiver.update(obj);
	});

	informer?.on('delete', (obj: KubernetesObject) => {
		// console.log('*- informer Delete ', obj);
		receiver.delete(obj);
	});

	informer?.on('error', (err: Error) => {
		console.log('*- informer Error', err);
		destroyInformers();
	});

	// console.log('*- informer listening for events...');
}
