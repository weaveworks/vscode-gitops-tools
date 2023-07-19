import * as k8s from '@kubernetes/client-node';
import { ActionOnInvalid } from '@kubernetes/client-node/dist/config_types';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';


export function createKubeProxyConfig(port: number): k8s.KubeConfig {
	const cluster = {
		name: kubeConfig.getCurrentCluster()?.name,
		server: `http://127.0.0.1:${port}`,
	};

	const user = kubeConfig.getCurrentUser();

	const context = {
		name: kubeConfig.getCurrentContext(),
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

