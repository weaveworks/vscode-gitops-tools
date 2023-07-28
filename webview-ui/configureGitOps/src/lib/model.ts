import { createEffect, createSignal, untrack } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';
import { params } from './params';
import { debug } from './utils/debug';
import { capitalize, namespacedSource } from './utils/helpers';

/* SOURCE */
export const [createSource, setCreateSource] = createSignal(true);

export const [source, setSource] = createStore({
	kind: 'GitRepository',

	name: 'podinfo',
	namespace: 'flux-system',

	interval: '1m0s',

	createSecret: false, // secretRef overrides other command authentication flags.
	secretRef: '', // this secret contains appropriate credentials for selected source type

	// azure
	createFluxConfig: true,
	azureScope: 'cluster',
});

export const [gitRepository, setGitRepository] = createStore({
	url: 'https://github.com/stefanprodan/podinfo',
	refType: 'branch',
	ref: 'master',

	// used the secretRef is not provided
	privateKeyFile: '', // for git
	caFile: '',
	username: '',
	password: '',

	recurseSubmodules: false,
	ignorePaths: '',
	silent: true, // assumes the deploy key is already setup, skips confirmation
});

export const [helmRepository, setHelmRepository] = createStore({
	url: 'https://stefanprodan.github.io/podinfo',

	username: '',
	password: '',

	caFile: '',
	keyFile: '', // for TLS
	certFile: '',

	passCredentials: false,
});

export const [ociRepository, setOciRepository] = createStore({
	url: 'oci://ghcr.io/stefanprodan/manifests/podinfo',
	ref: 'latest',
	refType: 'tag',
	provider: 'generic',
	ignorePaths: '',
	insecure: false, // non TLS HTTP for Bucket or OCI

	serviceAccount: '',
	certRef: '',
});

export const [bucket, setBucket] = createStore({
	// bucketEndpoint: 'minio.minio.svc.cluster.local:9000',
	endpoint: '',
	bucketName: 'podinfo',
	region: '',
	provider: 'generic',
	accessKey: '',
	secretKey: '',
	// sync

	insecure: false, // non TLS HTTP for Bucket or OCI
});


/* KUSTOMIZATION */

export const [createWorkload, setCreateWorkload] = createSignal(false);

export const [kustomization, setKustomization] = createStore({
	name: 'podinfo',
	namespace: 'flux-system',
	source: '',  // Ex: GitRepository/podinfo.flux-system
	path: '/kustomize',
	targetNamespace: 'default',
	serviceAccount: '',
	dependsOn: '',
	prune: true,
});

/*
 * TODO: add support for HelmRelease
export const [helmRelease, setHelmRelease] = createStore({
	name: 'podinfo',
	chart: 'podinfo',
	chartInterval: '1m0s',
	chartVersion: '>4.0.0', // (ignored for charts from GitRepository sources)
	crds:  'Create', // Skip, Create, CreateReplace
	createTargetNamespace: true,
	dependsOn: '', // supported formats '<name>' and '<namespace>/<name>'
	kubeconfigSecretRef: '', // the name of the Kubernetes Secret that contains a key with the kubeconfig file for connecting to a remote cluster
	reconcileStrategy: 'ChartVersion', // reconcile strategy for helm chart created by the helm release(accepted values: Revision and ChartRevision)
	releaseName: '', // defaults to a composition of '[<target-namespace>-]<HelmRelease-name>'
	serviceAccount: '',
	source: '', // TODO: refactor into workload store
	targetNamespace: '',
	values: '',
	valuesFrom: '',
});
 */


// EFFECTS
createEffect(() => {
	// do not delete - fixes reactivity weirdness
	JSON.stringify(params);

	if(params.gitInfo?.name) {
		setSource('name', params.gitInfo.name);
	}

	if(params.gitInfo?.branch) {
		setGitRepository('url', params.gitInfo.url);
	}

	if(params.gitInfo?.name) {
		setGitRepository('refType',  'branch');
		setGitRepository('ref', params.gitInfo.branch);
	}

	if(params.selectSourceTab) {
		setCreateWorkload(true);
		updateSelectedSource();
	}

	if(params.set) {
		for(const [store, values] of Object.entries(unwrap(params.set))) {
			const setter = setters[`set${capitalize(store)}`];
			for(const [k, v] of Object.entries((values || {}) as object)) {
				setter(k, v);
			}
		}

		if(params.set.createWorkload !== undefined) {
			setCreateWorkload(params.set.createWorkload);
		}
	}

});

createEffect(() => {
	if(createSource()) {
		setKustomization('source', `${source.kind}/${source.name}.${source.namespace}`);
	} else {
		updateSelectedSource();
	}
});

createEffect(() => {
	// no have Kustomization for HR
	if(source.kind === 'HelmRepository') {
		setCreateWorkload(false);
	}
});



// GETTERS AND SETTERS

interface StoreMap {
	[key: string]: any;
}

const getters: StoreMap = {
	source,
	gitRepository,
	ociRepository,
	helmRepository,
	bucket,
	kustomization,
	// getHelmRelease,
};

const setters: StoreMap = {
	setSource,
	setGitRepository,
	setOciRepository,
	setHelmRepository,
	setBucket,
	setKustomization,
};

export function updateSelectedSource() {
	if (params.selectedSource && params.selectedSource !== '') {
		setKustomization('source', params.selectedSource);
	} else if (params.sources?.length > 0) {
		setKustomization('source', namespacedSource(params.sources[0]));
	}
}

export function storeAccessors(props: any) {
	let get: ()=> any;
	let set: (v: any)=> any;

	get = props.get || (() => undefined);
	set = props.set || ((_: any) => undefined);

	if(props.store && props.field) {
		const store = props.store;
		const field = props.field;

		const getter = getters[`${store}`];
		const setter = setters[`set${capitalize(store)}`];

		get = () => getter[field];
		set = val => setter(field, val);
	}

	return {get, set};
}

