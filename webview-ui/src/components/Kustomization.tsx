import { bindCheckedValueFunc, bindInputStore, bindChangeValueFunc } from '../lib/bindDirectives';  bindCheckedValueFunc; bindInputStore; bindChangeValueFunc; // TS will elide 'unused' imports
import { createSource, selectedSource, createKustomization, setCreateKustomization, source, kustomization, setKustomization } from '../lib/model';


import { Checkbox, Select } from '@microsoft/fast-foundation';
import { createEffect, For, onMount, Show } from 'solid-js';
import { params } from '../lib/params';
import { unwrap } from 'solid-js/store';

let nsDropdown: Select;
let tnsDropdown: Select;
let checkbox: Checkbox;

const setNamespace = (val: string) => setKustomization('namespace', val);
const setTargetNamespace = (val: string) => {
	if(val === '<unset>') {
		setKustomization('targetNamespace', '');
	} else {
		setKustomization('targetNamespace', val);
	}
};

function Kustomization() {
	const repositoryName = () => createSource() ? source.name : selectedSource();

	const isAzure = () => params.clusterInfo?.isAzure;

	onMount(() => checkbox.checked = createKustomization());
	onMount(() => nsDropdown.currentValue = source.namespace);
	onMount(() => {
		if(!isAzure) {
			tnsDropdown.currentValue = 'default';
		}
	});

	const targetNamespaces = () => [...(params.namespaces?.values() || []), '<unset>'];


	return(
		<div>
			<h2>Create Kustomization</h2>
			<div style="margin-top: 1rem; margin-bottom: 2rem">
				<Show when={createSource()}>
					<vscode-checkbox ref={checkbox} use:bindCheckedValueFunc={setCreateKustomization}>
					Create a <code>Kustomization</code>
					</vscode-checkbox>
				</Show>
			</div>
			<Show when={createKustomization()}>
				<div>
					<label><code>Kustomization</code> Name</label>
					<input use:bindInputStore={[kustomization, setKustomization, 'name']}></input>
				</div>
				<Show when={!isAzure()}>
					<div>
						<label>Namespace</label>
						<div>
							<vscode-dropdown ref={nsDropdown} use:bindChangeValueFunc={setNamespace} class="medium">
								<For each={params.namespaces}>{(name, i) =>
									<vscode-option>{name}</vscode-option>
								}
								</For>
							</vscode-dropdown>
						</div>
					</div>
				</Show>
				<div>
					<label>File path in <code>GitRepository</code> '{repositoryName()}'</label>
					<input use:bindInputStore={[kustomization, setKustomization, 'path']} class="long"></input>
				</div>
				<Show when={!isAzure()}>
					<div>
						<label>Target Namespace</label>
						<div>
							<vscode-dropdown ref={tnsDropdown} use:bindChangeValueFunc={setTargetNamespace} class="medium" style="margin-bottom: 0.5rem">
								<For each={targetNamespaces()}>{(name, i) =>
									<vscode-option>{name}</vscode-option>
								}
								</For>
							</vscode-dropdown>
							<div><i>Namespace for objects reconciled by the <code>Kustomization</code></i></div>
						</div>
					</div>
				</Show>
				<div style="margin-top: 1.5rem">
					<label>Depends on <code>Kustomizations</code></label>
					<input use:bindInputStore={[kustomization, setKustomization, 'dependsOn']} class="long"></input>
				</div>
			</Show>
		</div>
	);
}

export default Kustomization;
