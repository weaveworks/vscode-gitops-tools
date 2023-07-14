// https://code.visualstudio.com/api/references/vscode-api#FileSystemWatcher
// make sure to test and debug switching kubeconfig from outside and from right click menu
// kubectl auth can-i watch gitrepository
// kubectl auth can-i watch kustomizations --all-namespaces
// kubectl api-resources -o wide
//  experiment how the fallbacks work by default if watch is disabled

// flux v 0.42: /apis/source.toolkit.fluxcd.io/v1beta2/gitrepositories
// flux prerelease: /apis/source.toolkit.fluxcd.io/v1/gitrepositories

/*
	* 1. exec kubectl proxy -p 0
	* 2. parse result to get port
	* 3. watch proxy for aliveness.
	* 4. watch kubeconfig for changes and update proxy process
	* 5. recreate informer as needed
	*/
import * as k8s from '@kubernetes/client-node';
import { kubectlApi } from 'cli/kubernetes/kubernetesToolsKubectl';
import { GitRepository } from 'types/flux/gitRepository';
import { Kind, KubernetesListObject, KubernetesObject } from 'types/kubernetes/kubernetesTypes';
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

async function informerKeepAlive<T extends KubernetesObject>(informer: k8s.Informer<T>) {
	try {
		await informer.start();
	} catch (err) {
		console.error('flux resources informer unavailable:', err);
		informer.stop();
		setTimeout(() => {
			console.info('Restarting informer...');
			informer.start();
			// this needs to be recursive
		}, 2000);

		return false;
	}
}

// registering an add function before informer start will fire for each existing object
// registering after the start wont fire for old objects
// autonomous is somehow simpler in this case


export let informer: k8s.Informer<GitRepository> & k8s.ObjectCache<GitRepository> | undefined;

export async function initFluxInformers(eventFn?: InformerEventFunc) {

	// await initKubeConfigWatcher(() => {
	// 	restartKubeProxy();
	// 	const contextName = aresult(getCurrentContextName());
	// 	console.log('kubeconfig changed event!', contextName);
	// });
	// initKubeProxy();
}

// await createFluxInformer();
// setInterval(() => createFluxInformer(), 1000);


// // DEBUG
// setInterval(() => {
// 	if(informer) {
// 		console.log('+Informer exists: ', Date().slice(19, 24), informer.list());
// 	} else {
// 		console.log('!No Informer: ', Date().slice(19, 24));
// 	}
// }, 1500);


export async function createFluxInformer() {
	// running already or no proxy
	// if(informer || !kubeProxyPort) {
	// 	return;
	// }

	// const kc = createKubeProxyConfig(kubeProxyPort);
	// console.log('starting informer...');

	// informer = await startInformer(Kind.GitRepository, kc);
	// if(!informer) {
	// 	console.log('failed to start informer');
	// 	return;
	// }

	// informer.on('error', (err: any) => {
	// 	console.error('informer error event', err);
	// 	if(informer) {
	// 		informer.stop();
	// 	}
	// 	informer = undefined;
	// });

	// console.log('informer started');
}


// will start a self-healing informer for each resource type and namespaces
async function startInformer(kind: Kind, kubeConfig: k8s.KubeConfig) {
	// const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
	const k8sCustomApi = kubeConfig.makeApiClient(k8s.CustomObjectsApi);

	const [plural, group, version] = getAPIPaths(kind);

	const listFn = async () => {
		const result = await k8sCustomApi.listClusterCustomObject(group, version, plural);
		const kbody = result.body as KubernetesListObject<GitRepository>;
		return Promise.resolve({response: result.response, body: kbody});
	};

	const kinformer = k8s.makeInformer(
		kubeConfig,
		`/apis/${group}/${version}/${plural}`,
		listFn,
	);

	try {
		await kinformer.start();
		return kinformer;
	} catch (err) {
		return undefined;
	}
}



// console.log('begin informer watch!');
// console.log('listing: ', informer.list());

// informer.on('add', (obj: KubernetesObject) => {
// 	console.log(`Added: ${obj.metadata?.name}`);
// });

// informer.on('update', (obj: KubernetesObject) => {
// 	console.log(`Updated: ${obj.metadata?.name}`);
// });

// informer.on('delete', (obj: KubernetesObject) => {
// 	console.log(`Deleted: ${obj.metadata?.name}`);
// });

// sourceDataProvider.add(obj);
// sourceDataProvider.update(obj);
// sourceDataProvider.delete(obj);

//

