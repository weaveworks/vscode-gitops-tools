
import * as kubernetes from 'vscode-kubernetes-tools-api';
import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import  deepEqual from 'lite-deep-equal';
import { ConfigurationV1_1 as KubernetesToolsConfigurationV1_1} from 'vscode-kubernetes-tools-api/js/configuration/v1_1';


// import { ConfigurationV1_1 } from 'vscode-kubernetes-tools-api/js/configuration/v1_1';
import { get } from 'http';
import { getContexts, getCurrentContextName, getCurrentContextWithCluster, getKubectlConfig } from 'cli/kubernetes/kubernetesConfig';
import { getCurrentClusterInfo } from 'ui/treeviews/treeViews';
import { aresult, failed, result, results } from 'types/errorable';
import { KubernetesCluster, KubernetesContext, KubernetesContextWithCluster } from 'types/kubernetes/kubernetesConfig';


// type KubeConfigUniqueParams = {
// 	contextName: string;
// 	clusterName: string;
// 	clusterServer: string;
// 	userName: string;
// };

let fsWacher: vscode.FileSystemWatcher | undefined;
let selectedKubeConfigPath: KubernetesToolsConfigurationV1_1.KubeconfigPath | undefined;
let contextWithCluster: KubernetesContextWithCluster | undefined;

export function kubeConfigPath(): string | undefined {
	if(selectedKubeConfigPath && selectedKubeConfigPath.pathType === 'host') {
		return selectedKubeConfigPath.hostPath;
	}
}


export async function initKubeConfigWatcher(changedFn: ()=> void) {
	const configuration = await kubernetes.extension.configuration.v1_1;
	if (!configuration.available) {
		return;
	}

	selectedKubeConfigPath = configuration.api.getKubeconfigPath();
	contextWithCluster = await getCurrentContextWithCluster();

	await initKubeConfigPathWatcher();
	console.log('watching kubeconfigs');
}


// when the user changes the KUBECONFIG path
// using the kubernetes tools extension
// let previousKubeConfigPath: k8s.ConfigurationV1_1.KubeconfigPath | undefined;

async function initKubeConfigPathWatcher() {
	const configuration = await kubernetes.extension.configuration.v1_1;
	if (!configuration.available) {
		return;
	}

	configuration.api.onDidChangeKubeconfigPath(path => {
		// fires twice
		console.log('path changed!', path);
		if(path !== selectedKubeConfigPath) {
			selectedKubeConfigPath = path;
			// TODO: recreate file watcher

			if(path.pathType === 'host') {
				stopFsWatcher();
				startFsWatcher(path.hostPath);
			} else {
				// disable file watcher for WSL for now
				console.error('WSL not yet supported');
				stopFsWatcher();
			}
		}
	});


	configuration.api.onDidChangeContext((context) => {
		// current context is changed, do something with it
		console.log('context changed!', context);
	});



}

function startFsWatcher(path: string) {
	const uri = vscode.Uri.file(path);
	const dirname = Utils.dirname(uri);
	const basename = Utils.basename(uri);
	// const data = await vscode.workspace.fs.readFile(uri);
	// console.log(data);

	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(dirname, basename));
	watcher.onDidChange((e) => {
		console.log('kubeconfig file changed!', e);
	});
}

function stopFsWatcher() {
	if(fsWacher) {
		fsWacher.dispose();
		fsWacher = undefined;
	}
}


async function initKubeConfigFileWatcher() {
	const configuration = await kubernetes.extension.configuration.v1_1;
	if (!configuration.available) {
		return;
	}

}
