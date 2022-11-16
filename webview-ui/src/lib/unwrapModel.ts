import { createEffect, createSignal } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';
import { createKustomization, createSource, kustomization, selectedSource, source } from './model';
import { params, ParamsDictionary } from './params';


function unwrapSource() {
	const s = unwrap(source);

	switch(s.kind) {
		case 'GitRepository':
			// Ex: s['branch'] = 'master'
			s[s.gitRefType] = s.gitRef;
			break;
		case 'OCIRepository':
			s[s.ociRefType] = s.ociRef;
			break;
	}

	for(const key in s) {
		if(s[key] === '') {
			delete s[key];
		}
	}

	return s;
}


export function unwrapModel() {
	const model: ParamsDictionary = {};

	if(createSource()) {
		model.source = unwrapSource();
	} else {
		model.selectedSource = selectedSource();
	}

	if(createKustomization()) {
		model.kustomization = unwrap(kustomization);
	}

	model.clusterInfo = unwrap(params).clusterInfo;

	return model;
}
