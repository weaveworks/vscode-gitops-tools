import * as k8s from '@kubernetes/client-node';
import { ActionOnInvalid } from '@kubernetes/client-node/dist/config_types';
import { kubeConfigPath } from './kubeConfigWatcher';

function loadDefaultKubeConfig(): k8s.KubeConfig {
	const kc = new k8s.KubeConfig();
	const opts = {onInvalidEntry: ActionOnInvalid.FILTER};
	const kcFilePath = kubeConfigPath();

	if(kcFilePath) {
		kc.loadFromFile(kcFilePath, opts);
	} else {
		kc.loadFromDefault();
	}

	return kc;
}

export function createKubeProxyConfig(port: number): k8s.KubeConfig {
	const kcDefault = loadDefaultKubeConfig();

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

