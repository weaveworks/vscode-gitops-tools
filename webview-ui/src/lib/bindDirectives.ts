import { Tabs } from '@microsoft/fast-foundation';
import { Select } from '@microsoft/fast-foundation';
import { Checkbox } from '@vscode/webview-ui-toolkit';
import { createEffect, createRenderEffect, onMount } from 'solid-js';
import { debug } from '../utils/debug';
import { source, setSource } from './model';

export function bindChangeTabsFunc(el: Tabs, update: any) {
	update()(el);

	el.addEventListener('change', (e: Event) => {
		update()(el);
	});
}

export function bindChangeValueFunc(el: Select, update: any) {
	el.addEventListener('change', (e: Event) => {
		update()(el.currentValue);
	});
}

export function bindCheckedValueFunc(el: Checkbox, update: any) {
	el.addEventListener('change', (e: Event) => {
		update()(el.checked);
	});
}


export function bindChangeValueSignal(el: Select, signal: any) {
	const [s, set] = signal();

	createEffect(() => el.currentValue = s());
	el.addEventListener('change', (e: Event) => set(el.currentValue));
}



export function bindInputStore(el: HTMLInputElement, update: any) {
	const [store, setStore, key] = update();

	createEffect(() => (el.value = store[key]));
	el.addEventListener('input', (e: Event) => setStore(key, el.value));
}


export function bindInputSignal(el: HTMLInputElement, value: any) {
	const [s, set] = value();

	createEffect(() => el.value = s());
	el.addEventListener('input', (e: Event) => set(el.value));
}




