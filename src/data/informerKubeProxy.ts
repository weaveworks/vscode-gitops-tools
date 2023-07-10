export let kubeProxyPort: number | undefined;

// export const fluxInformers: Record<string, FluxInformer> = {};
export async function initKubeProxy() {
	await startKubeProxy();
	setInterval(() => {
		if(!kubeProxyPort) {
			startKubeProxy();
		}
	}, 1000);
}



export async function startKubeProxy() {
	kubeProxyPort = 57375;
}

export function stopKubeProxy(): void {
	kubeProxyPort = undefined;
}






