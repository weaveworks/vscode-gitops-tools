import { Show } from 'solid-js';
import { bindInputStore, bindCheckedValueFunc, bindChangeValueFunc } from '../../../../../lib/bindDirectives';
bindInputStore; bindCheckedValueFunc; bindChangeValueFunc; // TS will elide 'unused' imports

import { source, setSource } from '../../../../../lib/model';
import { isOCIHelm } from '../../HelmRepository';


function HelmConnection() {
	return (
		<div>

			<div>
				<label><code>Secret</code> with authentication credentials (TLS, basic auth or docker-secret) <a href="https://fluxcd.io/flux/components/source/helmrepositories/#secret-reference"><span class="codicon codicon-question"></span></a></label>
				<input use:bindInputStore={[source, setSource, 'secretRef']} class="long"></input>
			</div>

			<Show when={!isOCIHelm()}>
				<div>
					<label>Path to TLS cert file</label>
					<input use:bindInputStore={[source, setSource, 'caFile']} class="long"></input>
				</div>

				<div>
					<label>Path to TLS key file</label>
					<input use:bindInputStore={[source, setSource, 'keyFile']} class="long"></input>
				</div>

				<div>
					<label>Path to TLS CA cert file </label>
					<input use:bindInputStore={[source, setSource, 'caFile']} class="long"></input>
				</div>
				<div>
					<label>Basic authentication username</label>
					<input use:bindInputStore={[source, setSource, 'username']} class="medium"></input>
				</div>
				<div>
					<label>Basic authentication password</label>
					<input use:bindInputStore={[source, setSource, 'password']} type="password" class="medium"></input>
				</div>


				<div style="margin-bottom: 1rem">
					<vscode-checkbox use:bindCheckedValueFunc={(checked: boolean) => setSource('helmPassCredentials', checked)}>
						Pass credentials to all domains (HTTP/S repositories only) <a href="https://fluxcd.io/flux/components/source/helmrepositories/#pass-credentials"><span class="codicon codicon-question"></span></a>
					</vscode-checkbox>
				</div>

			</Show>
		</div>
	);
}

export default HelmConnection;
