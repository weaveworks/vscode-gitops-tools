'use strict';

const vscode = acquireVsCodeApi();

/**
 * When creating the source - it will use the context/cluster that
 * was active when the webview was opened (and the one that shows in
 * the heading tags of the webview).
 */
const webviewTempState = {
	isAzure: false,
	clusterName: '',
	contextName: '',
	clusterProvider: '',
};

const sourceNameId = 'source-name';
// Generic cluster input ids
const fluxUrlId = 'url';
const fluxBranchId = 'branch';
const fluxTagId = 'tag';
const fluxSemverId = 'tag-semver';
const fluxIntervalId = 'interval';
const fluxTimeoutId = 'timeout';
const fluxCaFileId = 'ca-file';
const fluxPrivateKeyFileId = 'private-key-file';
const fluxUsernameId = 'username';
const fluxPasswordId = 'password';
const fluxSecretRefId = 'secret-ref';
// Azure cluster input ids
const azureUrlId = 'az-url';
const azureBranchId = 'az-branch';
const azureTagId = 'az-tag';
const azureSemverId = 'az-tag-semver';
const azureCommitId = 'az-commit';
const azureIntervalId = 'az-interval';
const azureTimeoutId = 'az-timeout';
const azureCaCertId = 'az-https-ca-cert';
const azureCaCertFileId = 'az-https-ca-cert-file';
const azureHttpsKeyId = 'az-https-key';
const azureHttpsUserId = 'az-https-user';
const azureKnownHostsId = 'az-known-hosts';
const azureKnownHostsFileId = 'az-known-hosts-file';
const azureLocalAuthRefId = 'az-local-auth-ref';
const azureSSHPrivateKeyId = 'az-ssh-private-key';
const azureSSHPrivateKeyFileId = 'az-ssh-private-key-file';
// Azure cluster Kustomization inputs
const azureKustomizationNameId = 'az-kustomization-name';
const azureKustomizationPathId = 'az-kustomization-path';
const azureKustomizationDependsOnId = 'az-kustomization-depends-on';
const azureKustomizationTimeoutId = 'az-kustomization-timeout';
const azureKustomizationSyncIntervalId = 'az-kustomization-sync-interval';
const azureKustomizationRetryIntervalId = 'az-kustomization-retry-interval';
const azureKustomizationPruneId = 'az-kustomization-prune';
const azureKustomizationForceId = 'az-kustomization-force';

/**
 * @typedef {{ id: string; title: string; flagName: string; }[]} FormItems
 */

// skipped flux flags: --git-implementation, --recurse-submodules, --ssh-ecdsa-curve, --ssh-key-algorithm, --ssh-rsa-bits
/** @type {FormItems} */
const genericClusterItems = [
	{
		id: fluxUrlId,
		title: 'Git repository url',
		flagName: '--url',
	},
	{
		id: fluxBranchId,
		title: 'Git branch',
		flagName: '--branch',
	},
	{
		id: fluxTagId,
		title: 'Git tag',
		flagName: '--tag',
	},
	{
		id: fluxSemverId,
		title: 'Git tag semver range',
		flagName: '--tag-semver',
	},
	{
		id: fluxIntervalId,
		title: 'Source sync interval (in minutes)',
		flagName: '--interval',
	},
	{
		id: fluxTimeoutId,
		title: 'Source sync timeout (in minutes)',
		flagName: '--timeout',
	},
	{
		id: fluxCaFileId,
		title: 'Path to TLS CA file used for validating self-signed certificates',
		flagName: '--ca-file',
	},
	{
		id: fluxPrivateKeyFileId,
		title: 'Path to a passwordless private key file used for authenticating to the Git SSH server',
		flagName: '--private-key-file',
	},
	{
		id: fluxUsernameId,
		title: 'Basic authentication username',
		flagName: '--username',
	},
	{
		id: fluxPasswordId,
		title: 'Basic authentication password',
		flagName: '--password',
	},
	{
		id: fluxSecretRefId,
		title: 'The name of an existing secret containing SSH or basic credentials',
		flagName: '--secret-ref',
	},
];

/** @type {FormItems} */
const azureClusterItems = [
	{
		id: azureUrlId,
		title: 'Git repository url',
		flagName: '--url',
	},
	{
		id: azureBranchId,
		title: 'Git branch',
		flagName: '--branch',
	},
	{
		id: azureTagId,
		title: 'Git tag',
		flagName: '--tag',
	},
	{
		id: azureSemverId,
		title: 'Git tag semver range',
		flagName: '--semver',
	},
	{
		id: azureCommitId,
		title: 'Git commit',
		flagName: '--commit',
	},
	{
		id: azureIntervalId,
		title: 'Source sync interval (in minutes)',
		flagName: '--interval',
	},
	{
		id: azureTimeoutId,
		title: 'Source sync timeout (in minutes)',
		flagName: '--timeout',
	},
	{
		id: azureCaCertId,
		title: 'Base64-encoded HTTPS CA certificate for TLS communication with private repository sync',
		flagName: '--https-ca-cert',
	},
	{
		id: azureCaCertFileId,
		title: 'File path to HTTPS CA certificate file for TLS communication with private repository sync',
		flagName: '--https-ca-cert-file',
	},
	{
		id: azureHttpsKeyId,
		title: 'HTTPS token/password for private repository sync',
		flagName: '--https-key',
	},
	{
		id: azureHttpsUserId,
		title: 'HTTPS username for private repository sync',
		flagName: '--https-user',
	},
	{
		id: azureKnownHostsId,
		title: 'Base64-encoded known_hosts data containing public SSH keys required to access private Git instances',
		flagName: '--known-hosts',
	},
	{
		id: azureKnownHostsFileId,
		title: 'File path to known_hosts contents containing public SSH keys required to access private Git instances',
		flagName: '--known-hosts-file',
	},
	{
		id: azureLocalAuthRefId,
		title: 'Local reference to a kubernetes secret in the configuration namespace to use for communication to the source',
		flagName: '--local-auth-ref',
	},
	{
		id: azureSSHPrivateKeyId,
		title: 'Base64-encoded private ssh key for private repository sync',
		flagName: '--ssh-private-key',
	},
	{
		id: azureSSHPrivateKeyFileId,
		title: 'File path to private ssh key for private repository sync',
		flagName: '--ssh-private-key-file',
	},
];
/** @type {FormItems} */
const azureKustomizationFormItems = [
	{
		id: azureKustomizationNameId,
		title: 'Name',
		flagName: 'name',
	},
	{
		id: azureKustomizationPathId,
		title: 'Path',
		flagName: 'path',
	},
	{
		id: azureKustomizationDependsOnId,
		title: 'Depends On',
		flagName: 'depends_on',
	},
	{
		id: azureKustomizationTimeoutId,
		title: 'Timeout',
		flagName: 'timeout',
	},
	{
		id: azureKustomizationSyncIntervalId,
		title: 'Sync interval',
		flagName: 'sync_interval',
	},
	{
		id: azureKustomizationRetryIntervalId,
		title: 'Retry interval',
		flagName: 'retry_interval',
	},
	{
		id: azureKustomizationPruneId,
		title: 'Prune (true or false)',
		flagName: 'prune',
	},
	{
		id: azureKustomizationForceId,
		title: 'Force (true or false)',
		flagName: 'force',
	},
];

// Element references
const $clusterName = document.getElementById('cluster-name');
const $clusteProviderHeader = document.getElementById('cluster-provider');
const $formItems = document.getElementById('form-items');
const $submitButton = document.getElementById('create-source');

$submitButton?.addEventListener('click', () => {
	if (webviewTempState.isAzure) {
		postVSCodeMessage({
			type: 'createSourceAzureCluster',
			value: {
				contextName: webviewTempState.contextName,
				clusterProvider: webviewTempState.clusterProvider,
				sourceName: getInputValue(sourceNameId),
				url: getInputValue(azureUrlId),
				branch: getInputValue(azureBranchId),
				tag: getInputValue(azureTagId),
				semver: getInputValue(azureSemverId),
				commit: getInputValue(azureCommitId),
				interval: getInputValue(azureIntervalId),
				timeout: getInputValue(azureTimeoutId),
				caCert: getInputValue(azureCaCertId),
				caCertFile: getInputValue(azureCaCertFileId),
				httpsUser: getInputValue(azureHttpsUserId),
				httpsKey: getInputValue(azureHttpsKeyId),
				knownHosts: getInputValue(azureKnownHostsId),
				knownHostsFile: getInputValue(azureKnownHostsFileId),
				localAuthRef: getInputValue(azureLocalAuthRefId),
				sshPrivateKey: getInputValue(azureSSHPrivateKeyId),
				sshPrivateKeyFile: getInputValue(azureSSHPrivateKeyFileId),
				kustomizationName: getInputValue(azureKustomizationNameId),
				kustomizationPath: getInputValue(azureKustomizationPathId),
				kustomizationDependsOn: getInputValue(azureKustomizationDependsOnId),
				kustomizationTimeout: getInputValue(azureKustomizationTimeoutId),
				kustomizationSyncInterval: getInputValue(azureKustomizationSyncIntervalId),
				kustomizationRetryInterval: getInputValue(azureKustomizationRetryIntervalId),
				kustomizationPrune: getInputValue(azureKustomizationPruneId),
				kustomizationForce: getInputValue(azureKustomizationForceId),
			},
		});
	} else {
		postVSCodeMessage({
			type: 'createSourceGenericCluster',
			value: {
				contextName: webviewTempState.contextName,
				sourceName: getInputValue(sourceNameId),
				url: getInputValue(fluxUrlId),
				branch: getInputValue(fluxBranchId),
				tag: getInputValue(fluxTagId),
				semver: getInputValue(fluxSemverId),
				interval: getInputValue(fluxIntervalId),
				timeout: getInputValue(fluxTimeoutId),
				caFile: getInputValue(fluxCaFileId),
				username: getInputValue(fluxUsernameId),
				password: getInputValue(fluxPasswordId),
				privateKeyFile: getInputValue(fluxPrivateKeyFileId),
				secretRef: getInputValue(fluxSecretRefId),
			},
		});
	}
});

/**
 * @param message {import('../src/webviews/createSourceWebview').MessageFromWebview}
 */
function postVSCodeMessage(message) {
	vscode.postMessage(message);
}
/**
 * @param {string} text
 */
function showNotification(text, isModal = false) {
	postVSCodeMessage({
		type: 'showNotification',
		value: {
			text,
			isModal,
		},
	});
}

/**
 * @param inputId {string}
 * @returns {string} input value or empty string
 */
function getInputValue(inputId) {
	return /** @type null | HTMLInputElement */ (document.getElementById(inputId))?.value || '';
}

window.addEventListener('message', event => {
	/** @type {import('../src/webviews/createSourceWebview').MessageToWebview} */
	const message = event.data;

	switch(message.type) {
		case 'updateWebviewContent': {

			webviewTempState.isAzure = message.value.isAzure;
			webviewTempState.contextName = message.value.contextName;
			webviewTempState.clusterName = message.value.clusterName;

			renderFormItems(
				webviewTempState.isAzure ? azureClusterItems : genericClusterItems,
				azureKustomizationFormItems,
				webviewTempState.isAzure,
			);

			// Update headers
			if ($clusterName) {
				$clusterName.textContent = `"${webviewTempState.clusterName}"`;
			}
			if ($clusteProviderHeader && message.value.clusterProvider !== 'Generic') {
				$clusteProviderHeader.textContent = `Cluster Provider: ${message.value.clusterProvider}`;
			}

			const $sourceName = /** @type null | HTMLInputElement */ (document.getElementById(sourceNameId));
			if ($sourceName) {
				$sourceName.value = message.value.newSourceName || '';
			}
			const $branch = /** @type null | HTMLInputElement */ (document.getElementById(webviewTempState.isAzure ? azureBranchId : fluxBranchId));
			if ($branch) {
				$branch.value = message.value.newSourceBranch || '';
			}
			const $url = /** @type null | HTMLInputElement */ (document.getElementById(webviewTempState.isAzure ? azureUrlId : fluxUrlId));
			if ($url) {
				$url.value = message.value.newSourceUrl || '';
			}

			break;
		}
	}
});

/**
 * Render different form for generic or Azure cluster
 * @param formItems {FormItems}
 * @param kustomizationItems {FormItems}
 * @param isAzure {boolean}
 */
function renderFormItems(formItems, kustomizationItems, isAzure) {
	// clear the form from any elements
	if ($formItems) {
		$formItems.innerHTML = '';
	}
	// render the form
	for (const item of formItems) {
		$formItems?.appendChild(renderFormItem(item));
	}

	if (isAzure) {
		const $kustomizationHeader = document.createElement('h2');
		$kustomizationHeader.textContent = 'Kustomization';
		const $hr = document.createElement('hr');

		$formItems?.appendChild($kustomizationHeader);
		$formItems?.appendChild($hr);

		for (const item of kustomizationItems) {
			$formItems?.appendChild(renderFormItem(item));
		}
	}
}

/**
 * @param item {FormItems[0]}
 * @returns {HTMLDivElement}
 */
function renderFormItem(item) {
	const $formItem = document.createElement('div');

	const $label = document.createElement('label');
	$label.classList.add('header-label');
	$label.htmlFor = item.id;
	$label.textContent = `${item.title} `;
	const $code = document.createElement('code');
	$code.textContent = item.flagName;
	const $input = document.createElement('input');
	$input.type = 'text';
	$input.id = item.id;

	$label.appendChild($code);
	$formItem.appendChild($label);
	$formItem.appendChild($input);

	return $formItem;
}
