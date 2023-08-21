import * as k8s from '@kubernetes/client-node';
import { createInformers, destroyInformers } from './informers';
import { kubeProxyConfig } from 'cli/kubernetes/kubectlProxy';

export let k8sCoreApi: k8s.CoreV1Api | undefined;
export let k8sCustomApi: k8s.CustomObjectsApi | undefined;

export function createK8sClients() {
	destroyK8sClients();

	if(kubeProxyConfig) {
		k8sCoreApi = kubeProxyConfig.makeApiClient(k8s.CoreV1Api);
		k8sCustomApi = kubeProxyConfig.makeApiClient(k8s.CustomObjectsApi);

		createInformers(kubeProxyConfig);
	}
}

export function destroyK8sClients() {
	destroyInformers();

	k8sCoreApi = undefined;
	k8sCustomApi = undefined;
}


