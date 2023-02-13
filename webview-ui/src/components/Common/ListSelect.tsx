import { storeAccessors } from 'lib/model';
import { ReactiveInputProps } from 'lib/types';
import { For, onMount } from 'solid-js';

function ListSelect(props: ReactiveInputProps) {
	// use <select> instead of <vscode-dropdown> because of <vscode-dropdown> initial value bugs
	let selectElement: HTMLSelectElement;

	const items = props.items;
	const {get, set} = storeAccessors(props);

	onMount(() => {
		selectElement.addEventListener('change', (e: Event) => {
			const old = get();
			set(selectElement.value);
			if(props.changed) {
				props.changed(old, selectElement.value);
			}
		});

		if(props.changed) {
			props.changed(selectElement.value, selectElement.value);
		}
	});

	return (
		<select ref={selectElement!} class={props.class} style={props.style}>
			<For each={items()}>{(name: string) =>
				<option selected={name === get()}>{name}</option>
			}
			</For>
		</select>
	);
}

export default ListSelect;
