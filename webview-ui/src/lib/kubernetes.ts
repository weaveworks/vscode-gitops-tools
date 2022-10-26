// http://localhost:8001/api/v1/namespaces

import { fetchJson } from '../utils/fetchJson';


export async function getNamespaces(): Promise<string[]> {
	const data = await fetchJson('http://localhost:8010/proxy/api/v1/namespaces');
	const items = data['items'] as any[];

	return items.map(item => item['metadata']?.name)
		.filter(name => name) as string[];
}

// import k8s from
// const kc = new k8s.KubeConfig();
// kc.loadFromDefault();

// const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// import got from 'got';


// const namespaces = JSON.parse(text.body);
// const ns = await k8sApi.listNamespace();
// k8sApi.listNamespacedPod('default')
//     .then((res) => {
//         // tslint:disable-next-line:no-console
//         console.log(res.body);
//     });

// // Example of instantiating a Pod object.
// const pod = {
// } as k8s.V1Pod;
