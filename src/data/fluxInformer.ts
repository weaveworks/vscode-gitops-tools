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
import { KubernetesListObject, KubernetesObject } from 'types/kubernetes/kubernetesTypes';

// export const fluxInformers: Record<string, FluxInformer> = {};

function startKubeProxy(): number | false  {
	return 57375;
}

// interface KubernetesCustomObject {
// 	'apiVersion'?: string;
// 	'kind'?: string;
// 	'metadata'?: k8s.V1ObjectMeta;
// 	'spec'?: k8s.V1PodSpec;
// 	'status'?: k8s.V1PodStatus;
// }

// export class FluxInformer {
// 	public list(): KubernetesObject[] {
// 		return [];
// 	}
// }

function createKubeProxyConfig(port: number): k8s.KubeConfig {
	const kcDefault = new k8s.KubeConfig();
	kcDefault.loadFromDefault();

	const cluster = {
		name: kcDefault.getCurrentCluster()?.name,
		server: `http://127.0.0.1:${port}`,
	};

	const user = kcDefault.getCurrentUser();

	const context = {
		name: kcDefault.getCurrentContext(),
		user: user?.name,
		cluster: cluster.name,
	};

	const kc = new k8s.KubeConfig();
	kc.loadFromOptions({
		clusters: [cluster],
		users: [user],
		contexts: [context],
		currentContext: context.name,
	});

	return kc;
}

function getAPIPaths() {
	return {
		'gitrepositories': ['source.toolkit.fluxcd.io', 'v1'],
	};
}


// will start a self-healing informer for each resource type and namespaces
export async function startFluxInformers(
	sourceDataProvider: any,
	workloadDataProvider: any,
	templateDataProvider: any): Promise<boolean> {
	const port = startKubeProxy();
	if(!port) {
		return false;
	}

	const kc = createKubeProxyConfig(port);

	const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
	const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

	const plural = 'gitrepositories';
	const [group, version] = getAPIPaths()[plural];

	const listFn = async () => {
		const result = await k8sCustomApi.listClusterCustomObject(group, version, plural);
		const kbody = result.body as KubernetesListObject<KubernetesObject>;
		return Promise.resolve({response: result.response, body: kbody});
	};

	const informer = k8s.makeInformer(
		kc,
		`/apis/${group}/${version}/${plural}`,
		listFn,
	);


	informer.on('add', (obj: KubernetesObject) => {
		console.log(`Added: ${obj.metadata?.name}`);
		sourceDataProvider.add(obj);
	});
	informer.on('update', (obj: KubernetesObject) => {
		console.log(`Updated: ${obj.metadata?.name}`);
		sourceDataProvider.update(obj);
	});
	informer.on('delete', (obj: KubernetesObject) => {
		console.log(`Deleted: ${obj.metadata?.name}`);
		sourceDataProvider.delete(obj);
	});
	informer.on('error', (err: any) => {
		console.error('ERRORed:', err);
		// Restart informer after 5sec
		setTimeout(() => {
			console.log('Restarting informer...');
			informer.start();
		}, 2000);
	});
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
	const l = informer.list();
	console.log('list:', l);

	return true;
}
