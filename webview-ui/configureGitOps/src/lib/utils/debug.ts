import { setParams } from '../params';

export function debug(str: string) {
	const e = document.getElementById('debug');
	if(e) {
		e.innerHTML = `${e.innerHTML}\n${str}`;
		// e.style.display = 'block';
		e.scrollTop = e.scrollHeight;
	}
}

export function debugStandalone() {
	const debugParams = {
		'clusterInfo': {
			'contextName': 'kind-context',
			'clusterName': 'kind-cluster',
			'clusterProvider': 'Generic',
			'isClusterProviderUserOverride': false,
			'isAzure': false,
		},
		'gitInfo': {
			'name': 'debug-standalone',
			'url': 'ssh://git@github.com/juozasg/pooodinfo.git',
			'branch': 'master',
		},
		'namespaces': [ 'default', 'flux-system', 'foobar'],
		'sources': [
			{'kind': 'GitRepository', metadata: {'name': 'podinfo',  'namespace': 'default'}},
			{'kind': 'OCIRepository', metadata: {'name': 'podinfo',  'namespace': 'default'}},
			{'kind': 'OCIRepository', metadata: {'name': 'podinfo',  'namespace': 'flux-system'}},
			{'kind': 'GitRepository', metadata: {'name': 'podinfo2', 'namespace': 'default'}},
			{'kind': 'OCIRepository', metadata: {'name': 'podinfo11',  'namespace': 'default'}}],
		'selectSourceTab': false,
		'selectedSource': 'GitRepository/podinfo2.default',
		// 'selectedSource': '',
		'set': {
			'kustomization': {
				'path': './test-set-path',
			},
			'createWorkload': true,
		},
	};

	setTimeout(() => {
		for(const [param, value] of Object.entries(debugParams)) {
			setParams(param, value);
		}
	}, 300);
}
