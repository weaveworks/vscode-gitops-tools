import { missingParams } from 'components/Main';
import { Show } from 'solid-js';

const isMissing = (name: string) => missingParams().includes(name);

export function RequiredWarning(props: { name: string; }) {
	const name = props.name;

	return(
		<Show when={isMissing(name)}>
			<span class="error">
				(required)
			</span>
		</Show>
	);

}
