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
const fluxGitImplementationId = 'git-implementation';
const fluxRecurseSubmodulesId = 'recurse-submodules';
const fluxEcdsaCurveId = 'ssh-ecdsa-curve';
const fluxSshKeyAlgorithmId = 'ssh-key-algorithm';
const fluxSshRsaBitsId = 'ssh-rsa-bits';
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

// Element references
const $clusterName = /** @type HTMLDivElement */ (document.getElementById('cluster-name'));
const $clusteProviderHeader = /** @type HTMLDivElement */ (document.getElementById('cluster-provider'));
const $genericForm = /** @type HTMLDivElement */ (document.getElementById('generic-form'));
const $azureForm = /** @type HTMLDivElement */ (document.getElementById('azure-form'));
const $submitButton = /** @type HTMLButtonElement */ (document.getElementById('create-source'));

$submitButton.addEventListener('click', () => {
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
				gitImplementation: getRadioValue(fluxGitImplementationId),
				sshKeyAlgorithm: getRadioValue(fluxSshKeyAlgorithmId),
				sshEcdsaCurve: getRadioValue(fluxEcdsaCurveId),
				sshRsaBits: getInputValue(fluxSshRsaBitsId),
				recurseSubmodules: getCheckboxValue(fluxRecurseSubmodulesId),
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
 * Get text input value (by id).
 * @param {string} inputId
 * @returns {string} input value or empty string
 */
function getInputValue(inputId) {
	return /** @type null | HTMLInputElement */ (document.getElementById(inputId))?.value || '';
}

/**
 * Get radio group checked value (by name).
 * @param {string} radioName
 * @returns {string} checked radio button value
 */
function getRadioValue(radioName) {
	return /** @type HTMLInputElement */ (document.querySelector(`input[name="${radioName}"]:checked`)).value;
}
/**
 * Get checkbox value (by id).
 * @param {string} checkboxId
 * @returns {boolean} true or false
 */
function getCheckboxValue(checkboxId) {
	return /** @type HTMLInputElement */ (document.getElementById(checkboxId)).checked;
}

window.addEventListener('message', event => {
	/** @type {import('../src/webviews/createSourceWebview').MessageToWebview} */
	const message = event.data;

	switch(message.type) {
		case 'updateWebviewContent': {

			webviewTempState.isAzure = message.value.isAzure;
			webviewTempState.contextName = message.value.contextName;
			webviewTempState.clusterName = message.value.clusterName;

			if (webviewTempState.isAzure) {
				showAzureForm();
			} else {
				showGenericForm();
			}

			// Update headers
			$clusterName.textContent = `"${webviewTempState.clusterName}"`;
			if (message.value.clusterProvider !== 'Generic') {
				$clusteProviderHeader.textContent = `Cluster Provider: ${message.value.clusterProvider}`;
			}

			// set default values to source name/url/branch
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

function showGenericForm() {
	$azureForm.hidden = true;
	$genericForm.hidden = false;
}
function showAzureForm() {
	$genericForm.hidden = true;
	$azureForm.hidden = false;
}

