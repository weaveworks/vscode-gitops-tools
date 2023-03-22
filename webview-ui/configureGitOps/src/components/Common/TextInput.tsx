import { gitRepository, source, storeAccessors } from 'lib/model';
import { createEffect, onMount } from 'solid-js';

import { ReactiveInputProps } from 'lib/types';



function TextInput(props: ReactiveInputProps) {
	let inputElement: HTMLInputElement;

	const {get, set} = storeAccessors(props);

	onMount(() => {
		createEffect(() => inputElement.value = get());

		inputElement.addEventListener('input', (e: Event) => set(inputElement.value));
	});

	return (
		<input ref={inputElement!} class={props.class} style={props.style} type={props.type}></input>
	);
}

export default TextInput;

