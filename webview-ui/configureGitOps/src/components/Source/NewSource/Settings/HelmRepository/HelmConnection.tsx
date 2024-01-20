import { Show } from 'solid-js';

import TextInput from 'components/Common/TextInput';
import { isOCIHelm } from '../../HelmRepository';
import Checkbox from 'components/Common/Checkbox';
import { source } from 'lib/model';
import { ToolkitHelpLink } from 'components/Common/HelpLink';



function SecretRefInput() {
	return (
		<div>
			<label><code>Secret</code> with authentication credentials (TLS, basic auth or docker-secret) </label> <ToolkitHelpLink href="source/helmrepositories/#secret-reference"/>

			<TextInput store="source" field="secretRef" class="long"/>
		</div>
	);
}


function HelmConnection() {
	return (
		<div>

			<Checkbox store="source" field="createSecret" style="margin-bottom: 1rem">Create new <code>Secret</code> with credentials
			</Checkbox>
			<ToolkitHelpLink href="source/helmrepositories/#secret-reference"/>

			<Show when={source.createSecret} fallback={SecretRefInput}>
				<div>
					<label>Basic authentication username</label>
					<TextInput store="helmRepository" field="username" class="medium"/>
				</div>

				<div>
					<label>Basic authentication password</label>
					<TextInput store="helmRepository" field="password" type="password" class="medium"/>
				</div>
				<Show when={!isOCIHelm()}>
					<div>
						<label>Path to TLS cert file</label>
						<TextInput store="helmRepository" field="certFile" class="long"/>
					</div>

					<div>
						<label>Path to TLS key file</label>
						<TextInput store="helmRepository" field="keyFile" class="long"/>
					</div>

					<div>
						<label>Path to TLS CA cert file </label>
						<TextInput store="helmRepository" field="caFile" class="long"/>
					</div>
				</Show>
			</Show>



		</div>
	);
}

export default HelmConnection;
