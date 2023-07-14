import * as k8s from '@kubernetes/client-node';
import { kubeConfig, onCurrentContextChanged } from 'cli/kubernetes/kubernetesConfig';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';
import { shell } from 'cli/shell/exec';
import { ChildProcess } from 'child_process';


export let kubeProxyConfig: k8s.KubeConfig | undefined;
let kubectlProxyProcess: ChildProcess | undefined;

// tries to keep alive the `kubectl proxy` process
// if process dies or errors out it will be stopped
// and restarted by the 1000ms interval
// if context changes proxy is stopped and restarted immediately
export function initKubeProxy() {
	startKubeProxy();

	// keep alive
	setInterval(async () => {
		if(!kubeProxyConfig) {
			await stopKubeProxy();
			await startKubeProxy();
		}
	}, 1000);

	// user switched kubeconfig context.
	onCurrentContextChanged.event(async () => {
		if(kubectlProxyProcess) {
			await stopKubeProxy();
		}
		await startKubeProxy();
	});
}

function procStarted(p: ChildProcess) {
	kubectlProxyProcess = p;
	console.log('got a proc!', p);

	p.on('exit', async code => {
		console.log('proc exit', p, code);
		stopKubeProxy();
	});

	p.on('error', err => {
		console.log('proc error', p, err);
		stopKubeProxy();
	});

	p.stdout?.on('data', (data: string) => {
		console.log(`proxy STDOUT: ${data}`);
		if(data.includes('Starting to serve on')) {
			const port = parseInt(data.split(':')[1].trim());
			kubeProxyConfig = makeProxyConfig(port);
		}
	});

	p.stderr?.on('data', (data: string) => {
		console.log(`proxy STDERR: ${data}`);
		stopKubeProxy();
	});
}


async function startKubeProxy() {
	console.log('startKubeProx');

	shell.exec('kubectl proxy -p 0', {callback: procStarted});
}

async function stopKubeProxy() {
	kubeProxyConfig = undefined;
	if(kubectlProxyProcess) {
		if(!kubectlProxyProcess.killed) {
			kubectlProxyProcess.kill();
		}
		kubectlProxyProcess = undefined;
	}
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

