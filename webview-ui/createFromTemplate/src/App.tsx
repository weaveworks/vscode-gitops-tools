import '@vscode/codicons/dist/codicon.css';
import '@vscode/codicons/dist/codicon.ttf';
import 'App.css';

import { allComponents, provideVSCodeDesignSystem } from '@vscode/webview-ui-toolkit';
import { onMount } from 'solid-js';

import { vscode } from 'lib/utils/vscode';
import { gitOpsTemplate, setGitOpsTemplate, values } from 'lib/model';
import { debug, debugStandalone } from 'lib/utils/debug';

import Main from 'components/Main';

provideVSCodeDesignSystem().register(allComponents);

function receiveParams() {
	// Handle the message inside the webview
	window.addEventListener('message', event => {
		const message = event.data; // The JSON data our extension sent

		switch (message.type) {
			case 'set-params':
				setGitOpsTemplate(message.params);
				break;
		}
	});
}

export function postModel(action: 'create' | 'show-yaml') {
	const model = {
		values:Object.fromEntries(values.entries()),
		template: gitOpsTemplate(),
	};
	vscode.postMessage({
		action,
		data: model,
	});

	console.log(model);
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
