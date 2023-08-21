import { KubeConfig } from '@kubernetes/client-node';
import { ChildProcess } from 'child_process';
import * as shell from 'cli/shell/exec';
import { destroyK8sClients } from 'k8s/client';
import { createProxyConfig } from 'k8s/createKubeProxyConfig';

// let isConnecting = false;
export let proxyProc: ChildProcess | undefined;
export let kubeProxyConfig: KubeConfig | undefined;

// tries to keep alive the `kubectl proxy` process
// if process dies or errors out it will be stopped
// and restarted by the 1000ms interval
// if context changes proxy is stopped and restarted immediately
export function kubeProxyKeepAlive() {
	// keep alive
	setInterval(async () => {
		if(!proxyProc) {
			destroyK8sClients();
			await startKubeProxy();
		}
	}, 2000);
}

async function startKubeProxy() {
	if(proxyProc) {
		await stopKubeProxy();
	}

	proxyProc = shell.execProc('kubectl proxy -p 0');
	console.log(`~proxy started ${proxyProc.pid}`);

	procListen(proxyProc);
}

function procListen(p: ChildProcess) {
	p.on('exit', async code => {
		console.log('~proxy exit', p.pid, code);
		if(proxyProc?.pid === p.pid) {
			stopKubeProxy();
		}
	});

	p.on('error', err => {
		console.log('~proxy error', p.pid, err);
		p.kill();
	});

	p.stdout?.on('data', (data: string) => {
		console.log(`~proxy ${p.pid} STDOUT: ${data}`);
		if(data.includes('Starting to serve on')) {
			const port = parseInt(data.split(':')[1].trim());
			kubeProxyConfig = createProxyConfig(port);
			console.log('~kubeproxy config ready');
		}
	});

	p.stderr?.on('data', (data: string) => {
		console.log(`~proxy ${p.pid} STDERR: ${data}`);
		p.kill();
	});
}


export async function stopKubeProxy() {
	if(proxyProc) {
		if(!proxyProc.killed) {
			console.log(`~proxy.kill() ${proxyProc.pid}`);
			proxyProc.kill();
		}
		proxyProc = undefined;
		kubeProxyConfig = undefined;

		destroyK8sClients();
		// isConnecting = false;
		console.log('~stopped kube proxy');
	}

}

export async function restartKubeProxy() {
	if(proxyProc) {
		await stopKubeProxy();
	}
	await startKubeProxy();
}
