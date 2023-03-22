import { Tabs } from '@microsoft/fast-foundation';
import { Checkbox } from '@vscode/webview-ui-toolkit';
import { createEffect, createRenderEffect, onMount } from 'solid-js';
import { debug } from './utils/debug';
import { source, setSource } from './model';

export function bindChangeTabsFunc(el: Tabs, update: any) {
	update()(el);

	el.addEventListener('change', (e: Event) => {
		update()(el);
	});
}


