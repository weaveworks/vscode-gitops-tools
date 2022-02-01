import { readFileSync } from 'fs';
import { Disposable, Uri, ViewColumn, Webview, WebviewPanel, window } from 'vscode';
import { azureTools, isAzureProvider } from '../azure/azureTools';
import { createBucketAzureCluster, createGitRepositoryAzureCluster, createGitRepositoryGenericCluster } from '../commands/createSource';
import { asAbsolutePath } from '../extensionContext';
import { fluxTools } from '../flux/fluxTools';
import { GitInfo } from '../git/getOpenedFolderGitInfo';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { CurrentClusterInfo } from '../views/treeViews';
import { getNonce, getWebviewOptions } from './webviewUtils';

/**
 * Message sent to webview to initialize it.
 */
interface CreateSourceUpdateWebviewContent {
	type: 'updateWebviewContent';
	value: {
		clusterName: string;
		contextName: string;
		clusterProvider: `${ClusterProvider}`;
		isClusterProviderUserOverride: boolean;
		isAzure: boolean;
		newSourceName: string;
		newSourceUrl: string;
		newSourceBranch: string;
	};
}
/**
 * Message sent from webview to create GitRepository source on a generic cluster
 */
export interface CreateSourceGitGenericCluster {
	type: 'createSourceGitGenericCluster';
	value: Parameters<typeof fluxTools['createSourceGit']>[0];
}

/**
 * Message sent from webview to create GitRepository source on Azure cluster
 */
export interface CreateSourceGitAzureCluster {
	type: 'createSourceGitAzureCluster';
	value: Parameters<typeof azureTools['createSourceGit']>[0];
}
/**
 * Message sent from webview to create Bucket source on Azure cluster
 */
export interface CreateSourceBucketAzureCluster {
	type: 'createSourceBucketAzureCluster';
	value: Parameters<typeof azureTools['createSourceBucket']>[0];
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
export interface WebviewLoaded {
	type: 'webviewLoaded';
	value: true;
}

/** Message sent from Extension to Webview */
export type MessageToWebview = CreateSourceUpdateWebviewContent;
/** Message sent from Webview to Extension */
export type MessageFromWebview = CreateSourceGitGenericCluster | CreateSourceGitAzureCluster | CreateSourceBucketAzureCluster | ShowNotification | WebviewLoaded;

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
	/** Only send message to webview when it's ready (html parsed, "message" event listener set) */
	private _onWebviewFinishedLoading = () => {};

	public static createOrShow(extensionUri: Uri, clusterInfo: CurrentClusterInfo, gitInfo: GitInfo | undefined) {
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

		CreateSourcePanel.currentPanel = new CreateSourcePanel(panel, extensionUri, clusterInfo, gitInfo);
	}

	public static revive(panel: WebviewPanel, extensionUri: Uri, clusterInfo: CurrentClusterInfo, gitInfo: GitInfo | undefined) {
		CreateSourcePanel.currentPanel = new CreateSourcePanel(panel, extensionUri, clusterInfo, gitInfo);
	}

	private constructor(panel: WebviewPanel, extensionUri: Uri, clusterInfo: CurrentClusterInfo, gitInfo: GitInfo | undefined) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update(clusterInfo, gitInfo);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(e => {
			if (this._panel.visible) {
				this._update(clusterInfo, gitInfo);
			}
		}, null, this._disposables );

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(async (message: MessageFromWebview) => {
			switch (message.type) {
				case 'createSourceGitGenericCluster': {
					await createGitRepositoryGenericCluster(message.value);
					break;
				}
				case 'createSourceGitAzureCluster': {
					await createGitRepositoryAzureCluster(message.value);
					break;
				}
				case 'createSourceBucketAzureCluster': {
					await createBucketAzureCluster(message.value);
					break;
				}
				case 'showNotification': {
					window.showInformationMessage(message.value.text, {
						modal: message.value.isModal,
					});
					break;
				}
				case 'webviewLoaded': {
					this._onWebviewFinishedLoading();
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

	private async _updateWebviewContent(clusterInfo: CurrentClusterInfo, gitInfo: GitInfo | undefined) {

		this._postMessage({
			type: 'updateWebviewContent',
			value: {
				clusterName: clusterInfo.clusterName,
				contextName: clusterInfo.contextName,
				clusterProvider: clusterInfo.clusterProvider,
				isAzure: isAzureProvider(clusterInfo.clusterProvider),
				isClusterProviderUserOverride: clusterInfo.isClusterProviderUserOverride,
				newSourceName: gitInfo?.newRepoName || '',
				newSourceUrl: gitInfo?.url || '',
				newSourceBranch: gitInfo?.branch || '',
			},
		});
	}

	/**
	 * Set webview html and send a message to update the contents.
	 */
	private async _update(clusterInfo: CurrentClusterInfo, gitInfo: GitInfo | undefined) {
		this._onWebviewFinishedLoading = () => {
			this._updateWebviewContent(clusterInfo, gitInfo);
			this._onWebviewFinishedLoading = () => {};
		};
		this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
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
					${readFileSync(asAbsolutePath('./media/createSource.html').fsPath).toString()}
				</main>
				<script nonce="${nonce}" src="${scriptUri}" defer></script>
			</body>
			</html>`;
	}
}
