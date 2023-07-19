import * as k8s from '@kubernetes/client-node';
import { createInformers, destroyInformers } from './informers';

export let k8sCoreApi: k8s.CoreV1Api | undefined;
export let k8sCustomApi: k8s.CustomObjectsApi | undefined;

export function createK8sClients(kc: k8s.KubeConfig) {
	destroyK8sClients();
	k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
	k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

	createInformers(kc);

}

export function destroyK8sClients() {
	destroyInformers();

	k8sCoreApi = undefined;
	k8sCustomApi = undefined;
}


