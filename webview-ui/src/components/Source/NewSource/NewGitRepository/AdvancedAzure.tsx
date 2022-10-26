import { Checkbox } from '@microsoft/fast-foundation';
import { onMount } from 'solid-js';
import { bindCheckedValueFunc, bindChangeValueFunc } from '../../../../lib/bindDirectives';  bindCheckedValueFunc; bindChangeValueFunc; // TS will elide 'unused' imports
import { source, setSource } from '../../../../lib/model';

let checkbox: Checkbox;

const setAzureScope = (val: string) => setSource('azureScope', val);

function AdvancedAzure() {
	onMount(() => checkbox.checked = source.createFluxConfig);

	return (
		<div style="margin-top: 1rem">
			<div>
				<vscode-checkbox ref={checkbox} use:bindCheckedValueFunc={(checked: boolean) => setSource('createFluxConfig', checked)}>
	        Create with FluxConfig
				</vscode-checkbox>
				<div><i>A new <code>FluxConfig</code> resource will be created to manage this <code>Kustomization</code></i></div>
			</div>
			<div style="margin-top: 1.5rem">
				<label>Scope</label>
				<div>
					<vscode-dropdown use:bindChangeValueFunc={setAzureScope}>
						<vscode-option>cluster</vscode-option>
						<vscode-option>namespace</vscode-option>
					</vscode-dropdown>
				</div>
			</div>
		</div>
	);
}

export default AdvancedAzure;
