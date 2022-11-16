import '@vscode/codicons/dist/codicon.css';
import '@vscode/codicons/dist/codicon.ttf';
import { For, Show } from 'solid-js';

import Kustomization from './Kustomization';
import Source from './Source';

import { createKustomization, createSource, kustomization, selectedSource, source } from '../lib/model';
import { vscode } from '../utils/vscode';
import { postModel } from '../App';



const repositoryKind = () => createSource() ? source.kind : selectedSource().split('/')[0];
const repositoryName = () => createSource() ? source.name : selectedSource().split('/')[1];
const repositoryAction = () => createSource() ? 'Create new' : 'Use existing';
const noActionPossible = () => !createKustomization() && !createSource();



function Main() {
	const debugBanner = vscode.vsCodeApi ? '' : '| DEBUG';

	return (
		<main>
			<textarea id='debug' style="display: none; height:220px">---</textarea>
			<h1>Configure GitOps {debugBanner}</h1>
			<vscode-divider></vscode-divider>
			<Source/>
			<vscode-divider></vscode-divider>
			<Kustomization/>
			<vscode-divider></vscode-divider>
			<div class="actions">
				<h2 style="margin-bottom: 2rem">Actions</h2>
				<Show when={!noActionPossible()}>
					<p>{repositoryAction()} <code>{repositoryKind()}</code> '{repositoryName()}'</p>
				</Show>
				<Show when={createKustomization()}>
					<p>Create new <code>Kustomization</code> '{kustomization.name}' for the <code>{repositoryKind()}</code></p>
				</Show>

				<Show when={noActionPossible()}>
					<p>No actions selected</p>
				</Show>
				<Show when={!noActionPossible() && missingFields().length === 0}>
					<vscode-button onClick={() => postModel('show-yaml')} class="big">
						<span class="yaml">YAML</span>
						<span slot="start" class="codicon codicon-output"></span>
					</vscode-button>
					<vscode-button onClick={() => postModel('create')} class="big">
						<span class="create">Create</span>
						<span slot="start" class="codicon codicon-add"></span>
					</vscode-button>
				</Show>

				{validation()}
			</div>
		</main>
	);
}
function validation() {
	const errors = missingFields();

	// console.log(unwrap(source));

	return(
		<Show when={errors.length > 0}>
			<For each={errors}>{(name, i) =>
				<p class="error">{name} missing</p>
			}
			</For>
		</Show>);
}


function missingFields() {
	if(!createSource()) {
		return [];
	}

	const fields = [];

	if(!(source.name?.length > 0)) {
		fields.push('Source name');
	}

	switch(source.kind) {
		case 'GitRepository':
			if(!(source.gitUrl?.length > 0)) {
				fields.push('Repository URL');
			}
			if(!(source.gitRef?.length > 0)) {
				fields.push('Source branch, tag or semver');
			}
			break;
		case 'HelmRepository':
			if(!(source.helmUrl?.length > 0)) {
				fields.push('Repository URL');
			}
			break;
		case 'OCIRepository':
			if(!(source.ociUrl?.length > 0)) {
				fields.push('Repository URL');
			}
			if(!(source.ociRef?.length > 0)) {
				fields.push('Source tag, semver or digest');
			}
			break;
			break;
		case 'Bucket':
			if(!(source.bucketName?.length > 0)) {
				fields.push('Bucket name');
			}
			if(!(source.bucketEndpoint?.length > 0)) {
				fields.push('Bucket endpoint');
			}
			if(source.bucketInsecure) {
				if(!(source.bucketAccessKey?.length > 0)) {
					fields.push('Bucket Access Key');
				}
				if(!(source.bucketSecretKey?.length > 0) || !(source.bucketSecretRef?.length > 0)) {
					fields.push('Bucket Secret Key or Secret Ref');
				}
			}
			break;

	}




	return fields;
}

export default Main;
