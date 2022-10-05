
const baseUrl = 'https://fluxcd.io/flux/components/';
export function ToolkitHelpLink(props: any)  {
	return HelpLink({...props, href: baseUrl + props.href });
}


export function HelpLink(props: any)  {
	return (
		<a href={props.href} style={`display: inline-block; position: relative; left: 0.4rem; bottom: 0.7rem;${props.style}`} >
			<span class="codicon codicon-question">
			</span>
		</a>
	);
}
