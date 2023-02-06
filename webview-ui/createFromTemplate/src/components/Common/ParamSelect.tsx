import { TemplateParam, values } from 'lib/model';
import { For, onMount } from 'solid-js';
import { RequiredWarning } from './RequiredWarning';

export function ParamSelect(props: {param: TemplateParam;}) {
	const param = props.param;

	let selectElement: HTMLSelectElement;

	onMount(() => {
		values.set(param.name, selectElement.value);

		selectElement.addEventListener('change', (e: Event) => {
			values.set(param.name, selectElement.value);
		});
	});

	return (
		<div style="margin-top: 2rem">
			<label style="font-weight: 500">{param.name}</label><br/>
			<select ref={selectElement!} style="margin-bottom:0.5rem">
				<For each={param.options}>
					{name =>
						<option selected={name === param.default}>{name}</option>
					}
				</For>
			</select >
			<br/><i>{param.description} <RequiredWarning name={param.name}/></i>
		</div>
	);
}
