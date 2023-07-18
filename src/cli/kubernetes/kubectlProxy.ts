import * as k8s from '@kubernetes/client-node';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';
import { shell } from 'cli/shell/exec';
import { ChildProcess } from 'child_process';
import { startFluxInformer, stopFluxInformer } from 'informer/kubernetesInformer';


export let kubeProxyConfig: k8s.KubeConfig | undefined;
let kubectlProxyProcess: ChildProcess | undefined;

// tries to keep alive the `kubectl proxy` process
// if process dies or errors out it will be stopped
// and restarted by the 1000ms interval
// if context changes proxy is stopped and restarted immediately
export function kubeProxyKeepAlive() {
	// keep alive
	setInterval(async () => {
		if(!kubeProxyConfig) {
			await stopKubeProxy();
			await startKubeProxy();
		}
	}, 1000);
}

async function startKubeProxy() {
	if(kubectlProxyProcess) {
		await stopKubeProxy();
	}

	kubectlProxyProcess = shell.execProc('kubectl proxy -p 0');
	console.log('started kube proxy process');

	procListen(kubectlProxyProcess);
}

function procListen(p: ChildProcess) {
	p.on('exit', async code => {
		console.log('proxy exit', p, code);
		stopKubeProxy();
	});

	p.on('error', err => {
		console.log('proxy error', p, err);
		stopKubeProxy();
	});

	p.stdout?.on('data', (data: string) => {
		console.log(`proxy STDOUT: ${data}`);
		if(data.includes('Starting to serve on')) {
			const port = parseInt(data.split(':')[1].trim());
			kubeProxyConfig = makeProxyConfig(port);
			console.log('kubeproxy config ready');

			stopFluxInformer();
			startFluxInformer();
		}
	});

	p.stderr?.on('data', (data: string) => {
		console.log(`proxy STDERR: ${data}`);
		stopKubeProxy();
	});
}


async function stopKubeProxy() {
	kubeProxyConfig = undefined;
	if(kubectlProxyProcess) {
		if(!kubectlProxyProcess.killed) {
			kubectlProxyProcess.kill();
		}
		kubectlProxyProcess = undefined;
	}

	stopFluxInformer();
	console.log('stopped kube proxy');

}

export async function restartKubeProxy() {
	if(kubectlProxyProcess) {
		await stopKubeProxy();
	}
	await startKubeProxy();
}


function makeProxyConfig(port: number) {
	const cluster = {
		name: kubeConfig.getCurrentCluster()?.name,
		server: `http://127.0.0.1:${port}`,
	};

	const user = kubeConfig.getCurrentUser();

	const context = {
		name: kubeConfig.getCurrentContext(),
		user: user?.name,
		cluster: cluster.name,
	};

	const kc = new k8s.KubeConfig();
	kc.loadFromOptions({
		clusters: [cluster],
		users: [user],
		contexts: [context],
		currentContext: context.name,
	});
	return kc;
}

