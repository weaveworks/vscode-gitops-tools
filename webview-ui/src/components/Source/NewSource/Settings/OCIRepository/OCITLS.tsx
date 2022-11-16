import { bindInputStore, bindCheckedValueFunc, bindChangeValueFunc } from '../../../../../lib/bindDirectives';
bindInputStore; bindCheckedValueFunc; bindChangeValueFunc; // TS will elide 'unused' imports
import { source, setSource } from '../../../../../lib/model';


function OCITLS() {
	return (
		<div>
			<div style="margin-bottom: 1rem">
				<vscode-checkbox use:bindCheckedValueFunc={(checked: boolean) => setSource('insecure', checked)}>
            Allow insecure (non-TLS) connection to the registry
				</vscode-checkbox>
			</div>

			<div>
				<label><code>Secret</code> used for TLS certificates <a href="https://fluxcd.io/flux/components/source/ocirepositories/#tls-certificates"><span class="codicon codicon-question"></span></a></label>
				<input use:bindInputStore={[source, setSource, 'certRef']} class="long"></input>
			</div>
		</div>
	);
}

export default OCITLS;
