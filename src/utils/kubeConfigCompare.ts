import deepEqual from 'lite-deep-equal';
import * as k8s from '@kubernetes/client-node';

export function kcTextChanged(kc1: k8s.KubeConfig, kc2: k8s.KubeConfig): boolean {
	// exportConfig() will omit tokens and certs
	return kc1.exportConfig() !== kc2.exportConfig();
}

export function kcContextsListChanged(kc1: k8s.KubeConfig, kc2: k8s.KubeConfig): boolean {
	const contexts1 = kc1.getContexts();
	const contexts2 = kc2.getContexts();

	return !deepEqual(contexts1, contexts2);
}

export function kcCurrentContextChanged(kc1: k8s.KubeConfig, kc2: k8s.KubeConfig): boolean {
	const context1 = kc1.getContextObject(kc1.getCurrentContext());
	const context2 = kc2.getContextObject(kc2.getCurrentContext());

	const cluster1 = kc1.getCurrentCluster();
	const cluster2 = kc2.getCurrentCluster();

	const user1 = kc1.getCurrentUser();
	const user2 = kc2.getCurrentUser();

	return !deepEqual(context1, context2) || !deepEqual(cluster1, cluster2) || !deepEqual(user1, user2);
}
