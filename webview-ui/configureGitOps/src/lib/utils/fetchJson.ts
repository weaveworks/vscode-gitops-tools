export async function fetchJson(url: string) {
	return await (await fetch(url)).json() as any;
}
