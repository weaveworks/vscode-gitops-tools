import '@vscode/codicons/dist/codicon.css';
import '@vscode/codicons/dist/codicon.ttf';
import { For, Show } from 'solid-js';

import Kustomization from './Kustomization';
import Source from './Source';

import { createWorkload, createSource, kustomization, source, gitRepository, helmRepository, ociRepository, bucket } from 'lib/model';
import { vscode } from 'lib/utils/vscode';
import { postModel } from 'App';
import { params } from 'lib/params';


const repositoryAction = () => createSource() ? 'Create new' : 'Use existing';
const noActionPossible = () => !createWorkload() && !createSource();

const kustomizationPossible = () => source.kind !== 'HelmRepository';

function Main() {
	const debugBanner = vscode.vsCodeApi ? '' : '| DEBUG';

	return (
		<main>
			<textarea id='debug' style="display: none; height:220px">---</textarea>
			<h1>Configure GitOps {debugBanner}</h1>
			<vscode-divider></vscode-divider>
			<Source/>
			<vscode-divider></vscode-divider>
			<Show when={kustomizationPossible()}>
				<Kustomization/>
				<vscode-divider></vscode-divider>
			</Show>
			<div class="actions">
				<h2 style="margin-bottom: 2rem">Actions</h2>
				<Show when={!noActionPossible()}>
					<p>{repositoryAction()} <code>{kustomization.source}</code></p>
				</Show>
				<Show when={createWorkload()}>
					<p>Create new <code>Kustomization/{kustomization.name}.{kustomization.namespace}</code> for <code>{kustomization.source}</code></p>
				</Show>

				<Show when={noActionPossible()}>
					<p>No actions selected</p>
				</Show>
				<Show when={!noActionPossible() && missingFields().length === 0}>
					<Show when={!params.clusterInfo?.isAzure}>
						<vscode-button onClick={() => postModel('show-yaml')} class="big">
							<span class="yaml">YAML</span>
							<span slot="start" class="codicon codicon-output"></span>
						</vscode-button>
					</Show>
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
			if(!(gitRepository.url?.length > 0)) {
				fields.push('Repository URL');
			}
			if(!(gitRepository.ref?.length > 0)) {
				fields.push('Source branch, tag or semver');
			}
			break;
		case 'HelmRepository':
			if(!(helmRepository.url?.length > 0)) {
				fields.push('Repository URL');
			}
			break;
		case 'OCIRepository':
			if(!(ociRepository.url?.length > 0)) {
				fields.push('Repository URL');
			}
			if(!(ociRepository.ref?.length > 0)) {
				fields.push('Source tag, semver or digest');
			}
			break;
		case 'Bucket':
			if(!(bucket.bucketName?.length > 0)) {
				fields.push('Bucket name');
			}
			if(!(bucket.endpoint?.length > 0)) {
				fields.push('Bucket endpoint');
			}
			if(bucket.provider === 'generic' || bucket.provider === 'azure') {
				if(source.secretRef.length === 0 && (bucket.accessKey.length === 0 || bucket.secretKey.length === 0)) {
					fields.push('Bucket Secret Ref or Access and Secret keys');
				}
			}
			break;
	}


	return fields;
}

export default Main;
