import * as k8s from '@kubernetes/client-node';

// export let informer: k8s.Informer<GitRepository> & k8s.ObjectCache<GitRepository> | undefined;

export let k8sCoreApi: k8s.CoreV1Api | undefined;
export let k8sCustomApi: k8s.CustomObjectsApi | undefined;
export let k8sWatch: k8s.Watch | undefined;

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
