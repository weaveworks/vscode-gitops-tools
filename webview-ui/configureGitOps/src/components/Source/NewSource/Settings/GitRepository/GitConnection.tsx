import Checkbox from 'components/Common/Checkbox';
import { ToolkitHelpLink } from 'components/Common/HelpLink';
import TextInput from 'components/Common/TextInput';
import { gitRepository, source } from 'lib/model';
import { Show } from 'solid-js';

function SecretRefInput() {
	return (
		<div>
			<label><code>Secret</code> with  SSH and/or HTTPS credentials</label>
			<TextInput store="source" field="secretRef" class="medium"/>
		</div>
	)
	;
}

const isSSH = () => gitRepository.url.toLowerCase().indexOf('ssh') === 0;

function SSHPrivateKeyFile() {
	return (
		<div>
			<label>Path to a passwordless SSH private key file</label>
			<TextInput store="gitRepository" field="privateKeyFile" class="long"/>
		</div>
	);
}


function GitConnection() {
	return (
		<div>
			<Checkbox store="source" field="createSecret" style="margin-bottom: 1rem">Create new <code>Secret</code> with credentials</Checkbox>
			<ToolkitHelpLink href="source/gitrepositories/#secret-reference"/>

			<Show when={source.createSecret} fallback={SecretRefInput}>
				<Show when={!isSSH()} fallback={SSHPrivateKeyFile}>
					<div>
						<label>HTTPS basic authentication username</label>
						<TextInput store="gitRepository" field="username" class="medium"/>
					</div>
					<div>
						<label>HTTPS basic authentication password</label>
						<TextInput store="gitRepository" field="password" class="medium" type="password"/>
					</div>
					<div>
						<label>HTTPS TLS Certificate Authority cert file</label>
						<TextInput store="gitRepository" field="caFile" class="long"/>
					</div>
				</Show>

			</Show>

		</div>
	);
}

export default GitConnection;
