import { createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { params, ParamsDictionary } from './params';

export const [createSource, setCreateSource] = createSignal(true);

export const [selectedSource, setSelectedSource] = createSignal('');

export const [source, setSource] = createStore({
	kind: 'GitRepository',

	name: 'podinfo',
	namespace: 'flux-system',

	gitUrl: 'https://github.com/stefanprodan/podinfo1',
	helmUrl: 'https://stefanprodan.github.io/podinfo',
	ociUrl: 'oci://ghcr.io/stefanprodan/manifests/podinfo',

	bucketEndpoint: 'minio.minio.svc.cluster.local:9000',
	bucketName: 'podinfo',
	bucketAccessKey: '',
	bucketSecretKey: '',
	bucketSecretRef: '',

	gitRef: 'master',
	gitRefType: 'branch',


	helmPassCredentials: false,

	ociRef: 'latest',
	ociRefType: 'tag',
	ociProvider: 'generic',

	// sync
	interval: '1m0s',
	timeout: '5m0s',

	// azure
	createFluxConfig: true,
	azureScope: 'cluster',

	// connection settings
	insecure: false, // non TLS HTTP for Bucket or OCI
	passCredentials: false, // HelmRepository
	username: '',
	password: '',
	secretRef: '',
	serviceAccount: '',
	caFile: '',
	certFile: '',
	certRef: '', // OCI
	privateKeyFile: '', // for git
	keyFile: '', // for TLS

	// gitImplementation: 'go-git',
	recurseSubmodules: false,
} as ParamsDictionary);


export const [createKustomization, setCreateKustomization] = createSignal(true);

export const [kustomization, setKustomization] = createStore({
	name: 'podinfo',
	namespace: 'flux-system',
	path: '/kustomize',
	targetNamespace: 'default',
	dependsOn: '',
	prune: true,
});



// window['source'] = source;


// init model when params are updated
function safeSetSource(name: any, val: any) {
	if(val) {
		setSource(name, val);
	}
}
createEffect(() => {
	safeSetSource('name', params.gitInfo?.name);
	safeSetSource('gitUrl', params.gitInfo?.url);
	safeSetSource('ref', params.gitInfo?.branch);

	if(params.selectedSource && params.selectedSource !== '') {
		setSelectedSource(params.selectedSource);
	}
});

