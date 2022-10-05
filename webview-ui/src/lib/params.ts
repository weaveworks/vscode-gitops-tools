import { createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debug } from '../utils/debug';

export interface ParamsDictionary {
	[index: string]: any;
}

export const [params, setParams] = createStore({} as ParamsDictionary);


export function updateParams(newParams: ParamsDictionary) {
	for(const [param, value] of Object.entries(newParams)) {
		setParams(param, value);
	}

	debug('params set:');
	debug(JSON.stringify(params));
}

