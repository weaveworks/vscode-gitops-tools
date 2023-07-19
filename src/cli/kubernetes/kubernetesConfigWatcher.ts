
import * as vscode from 'vscode';
import * as kubernetes from 'vscode-kubernetes-tools-api';
import { ConfigurationV1_1 as KubernetesToolsConfigurationV1_1 } from 'vscode-kubernetes-tools-api/js/configuration/v1_1';
import { Utils } from 'vscode-uri';

import { loadKubeConfig } from './kubernetesConfig';


let fsWacher: vscode.FileSystemWatcher | undefined;
let kubeConfigPath: string | undefined;

export async function loadKubeConfigPath(): Promise<string | undefined> {
	const configuration = await kubernetes.extension.configuration.v1_1;
	if (!configuration.available) {
		return;
	}

	return hostPath(configuration.api.getKubeconfigPath());
}

function hostPath(kcPath: KubernetesToolsConfigurationV1_1.KubeconfigPath): string | undefined {
	if(kcPath.pathType === 'host') {
		return kcPath.hostPath;
	}
}

export async function initKubeConfigWatcher() {
	const configuration = await kubernetes.extension.configuration.v1_1;
	if (!configuration.available) {
		return;
	}

	kubeConfigPath = await loadKubeConfigPath();

	await initKubeConfigPathWatcher();

	configuration.api.onDidChangeContext(context => {
		loadKubeConfig();
	});

	restartFsWatcher();

}


async function initKubeConfigPathWatcher() {
	const configuration = await kubernetes.extension.configuration.v1_1;
	if (!configuration.available) {
		return;
	}

	configuration.api.onDidChangeKubeconfigPath(async kcpath => {
		const path = hostPath(kcpath);
		// fires twice
		if(path !== kubeConfigPath) {
			kubeConfigPath = path;
			loadKubeConfig();

			restartFsWatcher();
		}
	});
}

function restartFsWatcher() {
	stopFsWatcher();

	if(!kubeConfigPath) {
		return;
	}

	const uri = vscode.Uri.file(kubeConfigPath);
	const dirname = Utils.dirname(uri);
	const basename = Utils.basename(uri);

	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(dirname, basename));
	watcher.onDidChange(e => {
		loadKubeConfig();
	});
}

function stopFsWatcher() {
	if(fsWacher) {
		fsWacher.dispose();
		fsWacher = undefined;
	}
}
