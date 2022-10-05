import { createEffect, createSignal } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';
import { params, ParamsDictionary } from './params';

export const [createSource, setCreateSource] = createSignal(true);

export const [selectedSource, setSelectedSource] = createSignal('');

export const [source, setSource] = createStore({
	name: 'podinfo',
	url: 'git@github.com:USERNAME/podinfo.git',
	refType: 'branch',
	ref: 'master',
	namespace: 'flux-system',
	kind: 'GitRepository',

	// sync
	interval: '1m0s',
	timeout: '5m0s',

	// azure
	createFluxConfig: true,
	azureScope: 'cluster',

	// connection
	// gitImplementation: 'go-git',
	recurseSubmodules: false,
	caFile: '',
	privateKeyFile: '',
	username: '',
	password: '',
	secretRef: '',
} as ParamsDictionary);


export const [createKustomization, setCreateKustomization] = createSignal(true);

export const [kustomization, setKustomization] = createStore({
	name: 'podinfo',
	namespace: 'flux-system',
	path: '/kustomize',
	targetNamespace: 'default',
	dependsOn: '',
});



export function unwrapModel() {
	const model: ParamsDictionary = {};

	if(createSource()) {
		model.source = unwrap(source);
	} else {
		model.selectedSource = selectedSource();
	}

	if(createKustomization()) {
		model.kustomization = unwrap(kustomization);
	}

	model.clusterInfo = unwrap(params).clusterInfo;

	// console.log(model);

	return model;
}

// window['source'] = source;


// init model when params are updated
function safeSetSource(name: any, val: any) {
	if(val) {
		setSource(name, val);
	}
}
createEffect(() => {
	safeSetSource('name', params.gitInfo?.name);
	safeSetSource('url', params.gitInfo?.url);
	safeSetSource('ref', params.gitInfo?.branch);

	if(params.selectedSource && params.selectedSource !== '') {
		setSelectedSource(params.selectedSource);
	}
	// console.log('update source.name');
});

