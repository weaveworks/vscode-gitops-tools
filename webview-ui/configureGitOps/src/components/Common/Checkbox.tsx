import { createEffect, onMount } from 'solid-js';
import { Checkbox as FastCheckbox} from '@microsoft/fast-foundation';
import { storeAccessors } from 'lib/model';
import { ReactiveInputProps } from 'lib/types';

function Checkbox(props: ReactiveInputProps) {
	let checkboxElement: FastCheckbox;

	const {get, set} = storeAccessors(props);

	onMount(() => {
		createEffect(() => checkboxElement.checked = get());

		checkboxElement.addEventListener('change', (e: Event) => {
			set(checkboxElement.checked);
		});
	});

	return (
		<vscode-checkbox ref={checkboxElement!} style={props.style}>
			{props.children}
		</vscode-checkbox>
	);
}

export default Checkbox;
