import '@vscode/codicons/dist/codicon.css';
import '@vscode/codicons/dist/codicon.ttf';
import { allComponents, provideVSCodeDesignSystem } from '@vscode/webview-ui-toolkit';
import { onMount } from 'solid-js';
import { vscode } from './utils/vscode';

import { unwrapModel } from './lib/unwrapModel';
import { updateParams } from './lib/params';
import { debug, debugStandalone } from './utils/debug';

import './App.css';
import Main from './components/Main';

provideVSCodeDesignSystem().register(allComponents);

function receiveParams() {
	// Handle the message inside the webview
	window.addEventListener('message', event => {
		const message = event.data; // The JSON data our extension sent

		switch (message.type) {
			case 'set-params':
				updateParams(message.params);
				break;
		}
	});
}

export function postModel(action: 'create' | 'show-yaml') {
	vscode.postMessage({
		action,
		data: unwrapModel(),
	});

	console.log(unwrapModel());
}


export default function App() {
	onMount(() => {
		debug('App mounted');
		vscode.postMessage({
			action: 'init-view',
		});

		receiveParams();

		if(!vscode.vsCodeApi) {
			debugStandalone();
		}
	});

	return (
		<Main/>
	);
}

