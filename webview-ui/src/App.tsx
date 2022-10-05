import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { allComponents, provideVSCodeDesignSystem} from '@vscode/webview-ui-toolkit';
import { vscode } from './utils/vscode';
import  '@vscode/codicons/dist/codicon.ttf';
import  '@vscode/codicons/dist/codicon.css';

import Source from './components/Source';
import Kustomization from './components/Kustomization';
import { debug, debugStandalone } from './utils/debug';
import { params, updateParams } from './lib/params';
import { createSource, selectedSource, source, createKustomization, unwrapModel, kustomization } from './lib/model';

import './App.css';

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

function submitModel() {
	vscode.postMessage({
		type: 'submit',
		data: unwrapModel(),
	});

	console.log(unwrapModel());

}

export default function App() {
	onMount(() => {
		debug('App mounted');
		vscode.postMessage({
			type: 'init-view',
		});

		receiveParams();
		// debugStandalone();
	});

	const repositoryName = () => createSource() ? source.name : selectedSource();
	const repositoryAction = () => createSource() ? 'Create new' : 'Use existing';
	const noActionPossible = () => !createKustomization() && !createSource();


	return (
		<main>
			<textarea id='debug' style="display: none; height:220px">---</textarea>
			<h1>Configure GitOps</h1>
			<vscode-divider></vscode-divider>
			<Source/>
			<vscode-divider></vscode-divider>
			<Kustomization/>
			<vscode-divider></vscode-divider>
			<div class="actions">
				<h2 style="margin-bottom: 2rem">Actions</h2>
				<Show when={!noActionPossible()}>
					<p>{repositoryAction()} <code>GitRepository</code> '{repositoryName()}'</p>
				</Show>
				<Show when={createKustomization()}>
					<p>Create new <code>Kustomization</code> '{kustomization.name}' for the <code>GitRepository</code></p>
				</Show>

				<Show when={noActionPossible()}>
					<p>No actions selected</p>
				</Show>
				<Show when={!noActionPossible() && missingFields().length === 0}>
					<vscode-button onClick={submitModel}>
						<span class="create">Create</span>
						<span slot="start" class="codicon codicon-add"></span>
					</vscode-button>
				</Show>

				{validation()}
			</div>
		</main>

	);
}

function missingFields()  {
	if(!createSource()) {
		return [];
	}

	const fields = [];

	if(!(source.name?.length > 0)) {
		fields.push('Source name');
	}

	if(!(source.url?.length > 0)) {
		fields.push('Source name');
	}

	if(!(source.ref?.length > 0)) {
		fields.push('Source branch, tag or semver');
	}

	return fields;
}

function validation() {
	return(
		<Show when={missingFields().length > 0}>
			<For each={missingFields()}>{(name, i) =>
				<p class="error">{name} missing</p>
			}
			</For>
		</Show>);
}
