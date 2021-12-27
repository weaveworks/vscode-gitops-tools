import { readFileSync } from 'fs';
import { Disposable, Uri, ViewColumn, Webview, WebviewPanel, window } from 'vscode';
import { AzureClusterProvider, azureTools } from '../azure/azureTools';
import { asAbsolutePath } from '../extensionContext';
import { fluxTools } from '../flux/fluxTools';
import { GitInfo } from '../git/getOpenedFolderGitInfo';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { getCurrentClusterInfo, refreshSourcesTreeView, refreshWorkloadsTreeView } from '../views/treeViews';
import { getNonce, getWebviewOptions } from './webviewUtils';

/**
 * Message sent to webview to initialize it.
 */
interface CreateSourceUpdateWebviewContent {
	type: 'updateWebviewContent';
	value: {
		clusterName: string;
		contextName: string;
		clusterProvider: string;
		isAzure: boolean;
		newSourceName: string;
		newSourceUrl: string;
		newSourceBranch: string;
	};
}
/**
 * Message sent from webview to create a source on a generic cluster
 */
export interface CreateSourceGenericCluster {
	type: 'createSourceGenericCluster';
	value: {
		contextName: string;
		sourceName: string;
		url: string;
		branch: string;
		tag: string;
		semver: string;
		interval: string;
		timeout: string;
		caFile: string;
		privateKeyFile: string;
		username: string;
		password: string;
		secretRef: string;
		gitImplementation: string;
		recurseSubmodules: boolean;
		sshKeyAlgorithm: string;
		sshEcdsaCurve: string;
		sshRsaBits: string;
	};
}
/**
 * Message sent from webview to create source on Azure cluster
 */
export interface CreateSourceAzureCluster {
	type: 'createSourceAzureCluster';
	value: {
		contextName: string;
		clusterProvider: string;
		sourceName: string;
		url: string;
		branch: string;
		tag: string;
		semver: string;
		commit: string;
		interval: string;
		timeout: string;
		caCert: string;
		caCertFile: string;
		httpsKey: string;
		httpsUser: string;
		knownHosts: string;
		knownHostsFile: string;
		localAuthRef: string;
		sshPrivateKey: string;
		sshPrivateKeyFile: string;
		kustomizationName: string;
		kustomizationPath: string;
		kustomizationDependsOn: string;
		kustomizationTimeout: string;
		kustomizationSyncInterval: string;
		kustomizationRetryInterval: string;
		kustomizationPrune: string;
		kustomizationForce: string;
	};
}
/**
 * Message sent from webview to show VSCode notificaion
 */
export interface ShowNotification {
	type: 'showNotification';
	value: {
		text: string;
		isModal: boolean;
	};
}

export type MessageToWebview = CreateSourceUpdateWebviewContent;
export type MessageFromWebview = CreateSourceGenericCluster | CreateSourceAzureCluster | ShowNotification;

/**
 * Manages create source webview panel.
 */
export class CreateSourcePanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: CreateSourcePanel | undefined;

	public static readonly viewType = 'createSource';

	private readonly _panel: WebviewPanel;
	private readonly _extensionUri: Uri;
	private _disposables: Disposable[] = [];

	public static createOrShow(extensionUri: Uri, gitInfo: GitInfo | undefined) {
		const column = window.activeTextEditor ? window.activeTextEditor.viewColumn : undefined;

		// If we already have a panel, show it.
		if (CreateSourcePanel.currentPanel) {
			CreateSourcePanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = window.createWebviewPanel(
			CreateSourcePanel.viewType,
			'Create Source',
			column || ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		CreateSourcePanel.currentPanel = new CreateSourcePanel(panel, extensionUri, gitInfo);
	}

	public static revive(panel: WebviewPanel, extensionUri: Uri, gitInfo: GitInfo | undefined) {
		CreateSourcePanel.currentPanel = new CreateSourcePanel(panel, extensionUri, gitInfo);
	}

	private constructor(panel: WebviewPanel, extensionUri: Uri, gitInfo: GitInfo | undefined) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update(gitInfo);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(e => {
			if (this._panel.visible) {
				this._update(gitInfo);
			}
		}, null, this._disposables );

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(async (message: MessageFromWebview) => {
			switch (message.type) {
				case 'createSourceGenericCluster': {
					await fluxTools.createSourceGit2({
						name: message.value.sourceName,
						url: message.value.url,
						branch: message.value.branch,
						semver: message.value.semver,
						tag: message.value.tag,
						interval: message.value.interval,
						timeout: message.value.timeout,
						caFile: message.value.caFile,
						username: message.value.username,
						password: message.value.password,
						privateKeyFile: message.value.privateKeyFile,
						secretRef: message.value.secretRef,
						gitImplementation: message.value.gitImplementation,
						recurseSubmodules: message.value.recurseSubmodules,
						sshKeyAlgorithm: message.value.sshKeyAlgorithm,
						sshEcdsaCurve: message.value.sshEcdsaCurve,
						sshRsaBits: message.value.sshRsaBits,
					});
					refreshSourcesTreeView();
					break;
				}
				case 'createSourceAzureCluster': {
					await azureTools.createSourceGit2({
						clusterProvider: message.value.clusterProvider as AzureClusterProvider,
						contextName: message.value.contextName,
						sourceName: message.value.sourceName,
						url: message.value.url,
						branch: message.value.branch,
						tag: message.value.tag,
						semver: message.value.semver,
						commit: message.value.commit,
						interval: message.value.interval,
						timeout: message.value.timeout,
						caCert: message.value.caCert,
						caCertFile: message.value.caCertFile,
						httpsUser: message.value.httpsUser,
						httpsKey: message.value.httpsKey,
						knownHosts: message.value.knownHosts,
						knownHostsFile: message.value.knownHostsFile,
						localAuthRef: message.value.localAuthRef,
						sshPrivateKey: message.value.sshPrivateKey,
						sshPrivateKeyFile: message.value.sshPrivateKeyFile,
						kustomizationName: message.value.kustomizationName,
						kustomizationPath: message.value.kustomizationPath,
						kustomizationDependsOn: message.value.kustomizationDependsOn,
						kustomizationTimeout: message.value.kustomizationTimeout,
						kustomizationSyncInterval: message.value.kustomizationSyncInterval,
						kustomizationRetryInterval: message.value.kustomizationRetryInterval,
						kustomizationPrune: message.value.kustomizationPrune,
						kustomizationForce: message.value.kustomizationForce,
					});
					refreshSourcesTreeView();
					refreshWorkloadsTreeView();
					break;
				}
				case 'showNotification': {
					window.showInformationMessage(message.value.text, {
						modal: message.value.isModal,
					});
					break;
				}
			}
		},
		null,
		this._disposables,
		);
	}

	public dispose() {
		CreateSourcePanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _postMessage(message: MessageToWebview) {
		this._panel.webview.postMessage(message);
	}

	private async _updateWebviewContent(gitInfo: GitInfo | undefined) {
		const clusterInfo = await getCurrentClusterInfo();
		if (!clusterInfo) {
			// window.showErrorMessage('Failed to get current cluster node or provider');
			return;
		}

		this._postMessage({
			type: 'updateWebviewContent',
			value: {
				clusterName: clusterInfo.clusterNode.clusterName,
				contextName: clusterInfo.clusterNode.contextName,
				clusterProvider: clusterInfo.clusterProvider,
				isAzure: clusterInfo.clusterProvider === ClusterProvider.AKS || clusterInfo.clusterProvider === ClusterProvider.AzureARC,
				newSourceName: gitInfo?.newRepoName || '',
				newSourceUrl: gitInfo?.url || '',
				newSourceBranch: gitInfo?.branch || '',
			},
		});
	}

	/**
	 * Set webview html and send a message to update the contents.
	 */
	private _update(gitInfo: GitInfo | undefined) {
		this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
		this._updateWebviewContent(gitInfo);
	}

	private _getHtmlForWebview(webview: Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = Uri.joinPath(this._extensionUri, 'media', 'createSource.js');

		// And the uri we use to load this script in the webview
		const scriptUri = (scriptPathOnDisk).with({ 'scheme': 'vscode-resource' });

		// Local path to css styles
		const styleResetPath = Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		const styleVSCodePath = Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
		const stylesPathMainPath = Uri.joinPath(this._extensionUri, 'media', 'createSource.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesVSCodeUri = webview.asWebviewUri(styleVSCodePath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesVSCodeUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

				<title>Create Source</title>
			</head>
			<body>
				<main class="app">
					<h2>Create Source on the <code id="cluster-name">Unknown</code> cluster</h2>
					<h3 id="cluster-provider"></h3>
					<hr>
					<div>
						<label class="header-label" for="source-name">Source Name</label>
						<input type="text" id="source-name">
					</div>
					<div>
						<label class="header-label" for="git">Source Kind <code></code></label>
						<input type="radio" id="git" name="kind" value="git" checked> <label for="git">Git Repository</label>
					</div>
					${readFileSync(asAbsolutePath('./media/createSource.html').fsPath).toString()}
					<button type="button" id="create-source" class="submit-button">Create</button>
				</main>

				<script nonce="${nonce}" src="${scriptUri}" defer></script>
			</body>
			</html>`;
	}
}
