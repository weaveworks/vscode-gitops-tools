import { postModel } from 'App';
import { gitOpsTemplate, TemplateParam, values } from 'lib/model';
import { For, Show } from 'solid-js';
import { ParamSelect } from './Common/ParamSelect';
import ParamInput from './Common/ParamTextInput';


const isSelectOption = (param: TemplateParam) => param.options && param.options.length > 0;

const requiredParams = () => gitOpsTemplate().params.filter(p => p.required).map(p => p.name);
export const missingParams = () => requiredParams().filter(name => !values.get(name));

function ValidationMessage() {
	return (
		<p class="error">Missing required parameters</p>
	);
}

export default function Main() {
	return(
		<div>
			<h2 style="margin: 1rem 0">Configure {gitOpsTemplate().name}</h2>
			<h3 style="margin-top: 0rem;"><i>{gitOpsTemplate().description}</i></h3>
			<For each={gitOpsTemplate().params}>{(param, i) =>
				<Show when={isSelectOption(param)} fallback={<ParamInput param={param}/>}>
					<ParamSelect param={param} />
				</Show>
			}
			</For>



			<div style="margin-top: 2rem" class="actions">
				<Show when={missingParams().length === 0} fallback={ValidationMessage}>
					<vscode-button onClick={() => postModel('show-yaml')} class="big">
						<span class="yaml" style="padding-top: 0.25rem;">Save</span>
						<span slot="start" class="codicon codicon-output"></span>
					</vscode-button>
				</Show>
			</div>
			<br/>
			<i>Save YAML to: <code>{gitOpsTemplate().folder}</code></i>
			<br/>
			<br/>
			<br/>
		</div>
	);
}

