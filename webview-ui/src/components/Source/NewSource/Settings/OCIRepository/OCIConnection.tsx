import { bindInputStore, bindCheckedValueFunc, bindChangeValueFunc } from '../../../../../lib/bindDirectives';  bindInputStore; bindCheckedValueFunc; bindChangeValueFunc; // TS will elide 'unused' imports
import { source, setSource } from '../../../../../lib/model';

const setOCIProvider = (val: string) => setSource('ociProvider', val);


function OCIConnection() {
	return (
		<div>
			<div style="margin-bottom: 1rem"><i>Authentication settings for private repositories</i></div>
			<div>
				<label>OCI Provider</label>
				<div class="flex-row">
					<vscode-dropdown use:bindChangeValueFunc={setOCIProvider}>
						<vscode-option>generic</vscode-option>
						<vscode-option>aws</vscode-option>
						<vscode-option>azure</vscode-option>
						<vscode-option>gcp</vscode-option>
					</vscode-dropdown>
				</div>
			</div>

			<div>
				<label><code>Secret</code> with authentication credentials for the repository <a href="https://fluxcd.io/flux/components/source/ocirepositories/#secret-reference"><span class="codicon codicon-question"></span></a></label>
				<input use:bindInputStore={[source, setSource, 'secretRef']} class="long"></input>
			</div>

			<div>
				<label><code>ServiceAccount</code> with image pull secrets for authentication</label>
				<input use:bindInputStore={[source, setSource, 'serviceAccount']} class="long"></input>
			</div>

		</div>
	);
}

export default OCIConnection;
