import { unwrap } from 'solid-js/store';
import { createWorkload, createSource, kustomization, source, gitRepository, ociRepository, helmRepository, bucket } from './model';
import { params, ParamsDictionary } from './params';


function unwrapSourceKind() {
	switch(source.kind) {
		case 'GitRepository':
			return unwrap(gitRepository);

		case 'OCIRepository':
			return unwrap(ociRepository);

		case 'HelmRepository':
			return unwrap(helmRepository);

		case 'Bucket':
			return unwrap(bucket);
	}
}

function unwrapSource() {
	let s: any = unwrap(source);

	if(s.createSecret && s.kind !== 'OCIRepository') {
		s['secretRef'] = '';
	}

	// merge common and specific type source parameters
	s = {...s, ...unwrapSourceKind()};


	if(s['refType']) {
		// s['tag'] = 'latest';
		s[s['refType']] = s['ref'];
		delete s['refType'];
		delete s['ref'];
	}


	return s;
}


function unwrapKustomization() {
	const k = unwrap(kustomization);

	if(k.targetNamespace === '<unset>') {
		k.targetNamespace = '';
	}

	return k;
}


export function unwrapModel() {
	const model: ParamsDictionary = {};

	if(createSource()) {
		model.source = unwrapSource();
	}

	if(createWorkload()) {
		model.kustomization = unwrapKustomization();
	}

	model.clusterInfo = unwrap(params).clusterInfo;

	return model;
}
