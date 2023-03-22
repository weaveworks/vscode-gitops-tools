import { TemplateParam, values } from 'lib/model';
import { onMount } from 'solid-js';
import { RequiredWarning } from './RequiredWarning';


function ParamInput(props: { param: TemplateParam; }) {
	const param = props.param;
	const name = param.name;

	let inputElement: HTMLInputElement;
	onMount(() => {
		values.set(name, inputElement.value);

		inputElement.addEventListener('input', (e: Event) => values.set(name, inputElement.value));
	});

	return (
		<div style="margin-top: 2rem">
			<label style="font-weight: 500">{param.name}</label><br/>
			<input ref={inputElement!} style="margin-bottom:0.5rem" value={param.default || ''}></input>
			<i>{param.description} <RequiredWarning name={name}/></i>
		</div>
	);
}

export default ParamInput;

export {};
