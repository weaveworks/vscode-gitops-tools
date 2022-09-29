'use strict';

const vscode = acquireVsCodeApi();

/**
 * When creating the source - it will use the context/cluster that
 * was active when the webview was opened (and the one that shows in
 * the heading tags of the webview).
 *
 * @type { {
 * isAzure: boolean;
 * clusterName: string;
 * contextName: string;
 * clusterProvider: 'AKS' | 'Azure Arc' | 'Generic' | 'Unknown' | 'DetectionFailed';
 * isClusterProviderUserOverride: boolean;
 * sourceKind: 'GitRepository' | 'Bucket';
 * }}
 */
const webviewTempState = {
	isAzure: false,
	clusterName: '',
	contextName: '',
	clusterProvider: 'Generic',
	isClusterProviderUserOverride: false,
	sourceKind: 'GitRepository',
};

// Generic cluster input ids
const fluxGitSourceNameId = 'git-source-name';
const fluxUrlId = 'url';
const fluxBranchId = 'branch';
const fluxTagId = 'tag';
const fluxSemverId = 'tag-semver';
const fluxIntervalId = 'interval';
const fluxTimeoutId = 'timeout';
const fluxGitImplementationId = 'git-implementation';
const fluxGoGitImplementationId = 'go-git';
const fluxLibgit2ImplementationId = 'libgit2';
const fluxSshKeyAlgorithmEcdsa = 'ecdsa';
const fluxSshKeyAlgorithmRsa = 'rsa';
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
const azureConfigurationNameId = 'az-configuration-name';
const azureSourceKindName = 'az-kind';
const azureSourceKindGitId = 'az-kind-git';
const azureSourceKindBucketId = 'az-kind-bucket';
const azureUrlId = 'az-url';
const azureBranchId = 'az-branch';
const azureScopeId = 'az-scope';
const azureNamespaceId = 'az-namespace';
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
// Azure bucket form inputs
const azureBucketUrlId = 'az-bucket-url';
const azureBucketNameId = 'az-bucket-name';
const azureBucketAccessKeyId = 'az-bucket-access-key';
const azureBucketSecretKeyId = 'az-bucket-secret-key';
const azureBucketInsecureId = 'az-bucket-insecure';
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
const $azureSourceGitForm = /** @type HTMLDivElement */ (document.getElementById('az-source-git-form'));
const $azureSourceBucketForm = /** @type HTMLDivElement */ (document.getElementById('az-source-bucket-form'));
const $submitButton = /** @type HTMLButtonElement */ (document.getElementById('create-source'));
const $recurseSubmodulesSection = /** @type HTMLDivElement */ (document.getElementById('recurse-submodules-section'));
const $sshEcdsaCurveSection = /** @type HTMLDivElement */ (document.getElementById('ssh-ecdsa-curve-section'));
const $sshRsaBitsSection = /** @type HTMLDivElement */ (document.getElementById('ssh-rsa-bits-section'));
// Inputs
const $goGitImplementation = /** @type HTMLInputElement */ (document.getElementById(fluxGoGitImplementationId));
const $libgit2Implementation = /** @type HTMLInputElement */ (document.getElementById(fluxLibgit2ImplementationId));
const $ecdsa = /** @type HTMLInputElement */ (document.getElementById(fluxSshKeyAlgorithmEcdsa));
const $rsa = /** @type HTMLInputElement */ (document.getElementById(fluxSshKeyAlgorithmRsa));
const $azureSourceKindGit = /** @type HTMLInputElement */ (document.getElementById(azureSourceKindGitId));
const $azureSourceKindBucket = /** @type HTMLInputElement */ (document.getElementById(azureSourceKindBucketId));

$submitButton.addEventListener('click', () => {
	if (webviewTempState.sourceKind === 'Bucket') {
		if (webviewTempState.isAzure) {
			postVSCodeMessage({
				type: 'createSourceBucketAzureCluster',
				value: {
					contextName: webviewTempState.contextName,
					// @ts-ignore
					clusterProvider: webviewTempState.clusterProvider,
					configurationName: getInputValue(azureConfigurationNameId),
					bucketName: getInputValue(azureBucketNameId),
					sourceScope: sendIfNotDefaultValue('az-scope', getRadioValue(azureScopeId)),
					sourceNamespace: sendIfNotDefaultValue('az-namespace', getInputValue(azureNamespaceId)),
					url: getInputValue(azureBucketUrlId),
					accessKey: getInputValue(azureBucketAccessKeyId),
					secretKey: getInputValue(azureBucketSecretKeyId),
					insecure: getCheckboxValue(azureBucketInsecureId),
					kustomizationName: getInputValue(azureKustomizationNameId),
					kustomizationPath: getInputValue(azureKustomizationPathId),
					kustomizationDependsOn: getInputValue(azureKustomizationDependsOnId),
					kustomizationTimeout: getInputValue(azureKustomizationTimeoutId),
					kustomizationSyncInterval: getInputValue(azureKustomizationSyncIntervalId),
					kustomizationRetryInterval: getInputValue(azureKustomizationRetryIntervalId),
					kustomizationPrune: getCheckboxValue(azureKustomizationPruneId),
					kustomizationForce: getCheckboxValue(azureKustomizationForceId),
				},
			});
		} else {
			// TODO: create bucket on generic cluster
		}
	} else {
		if (webviewTempState.isAzure) {
			postVSCodeMessage({
				type: 'createSourceGitAzureCluster',
				value: {
					contextName: webviewTempState.contextName,
					// @ts-ignore
					clusterProvider: webviewTempState.clusterProvider,
					sourceKind: webviewTempState.sourceKind,
					sourceName: getInputValue(azureConfigurationNameId),
					sourceScope: sendIfNotDefaultValue('az-scope', getRadioValue(azureScopeId)),
					sourceNamespace: sendIfNotDefaultValue('az-namespace', getInputValue(azureNamespaceId)),
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
					kustomizationPrune: getCheckboxValue(azureKustomizationPruneId),
					kustomizationForce: getCheckboxValue(azureKustomizationForceId),
				},
			});
		} else {
			postVSCodeMessage({
				type: 'createSourceGitGenericCluster',
				value: {
					contextName: webviewTempState.contextName,
					sourceName: getInputValue(fluxGitSourceNameId),
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
					gitImplementation: sendIfNotDefaultValue('git-implementation', getRadioValue(fluxGitImplementationId)),
					sshKeyAlgorithm: sendIfNotDefaultValue('ssh-key-algorithm', getRadioValue(fluxSshKeyAlgorithmId)),
					sshEcdsaCurve: sendIfNotDefaultValue('ssh-ecdsa-curve', getRadioValue(fluxEcdsaCurveId)),
					sshRsaBits: sendIfNotDefaultValue('ssh-rsa-bits', getInputValue(fluxSshRsaBitsId)),
					recurseSubmodules: getCheckboxValue(fluxRecurseSubmodulesId),
				},
			});
		}
	}
});

// ──── Interactivity ─────────────────────────────────────────
// Only show --recurse-submodules if the --git-implementation is `go-git`
for (const $gitImplementation of document.querySelectorAll(`[name="${fluxGitImplementationId}"]`) || []) {
	$gitImplementation.addEventListener('click', () => {
		$recurseSubmodulesSection.hidden = !$goGitImplementation.checked;
	});
}
for (const $sshAlgorithm of document.querySelectorAll(`[name="${fluxSshKeyAlgorithmId}"]`) || []) {
	$sshAlgorithm.addEventListener('click', () => {
		// Only show --ssh-ecdsa-curve if the --ssh-key-algorithm is `ecdsa`
		$sshEcdsaCurveSection.hidden = !$ecdsa.checked;
		// Only show --ssh-rsa-bits if the --ssh-key-algorithm is `rsa`
		$sshRsaBitsSection.hidden = !$rsa.checked;
	});
}
// Change visible Azure form depending on source kind (git or bucket)
for (const $azureSouceKind of document.querySelectorAll(`[name="${azureSourceKindName}"]`) || []) {
	$azureSouceKind.addEventListener('click', () => {
		if ($azureSourceKindGit.checked) {
			showAzureGitForm();
			webviewTempState.sourceKind = 'GitRepository';
		} else if ($azureSourceKindBucket.checked) {
			showAzureBucketForm();
			webviewTempState.sourceKind = 'Bucket';
		}
	});
}
// ────────────────────────────────────────────────────────────
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

/**
 * Don't send default input values.
 *
 * @param {'git-implementation' | 'ssh-key-algorithm' | 'ssh-ecdsa-curve' | 'ssh-rsa-bits' | 'az-scope' | 'az-namespace'} inputName
 * @param {string} value
 */
function sendIfNotDefaultValue(inputName, value) {
	if (
		(inputName === 'git-implementation' && value === 'go-git') ||
		(inputName === 'ssh-key-algorithm' && value === 'ecdsa') ||
		(inputName === 'ssh-ecdsa-curve' && value === 'p384') ||
		(inputName === 'ssh-rsa-bits' && value === '2048') ||
		(inputName === 'az-scope' && value === 'cluster') ||
		(inputName === 'az-namespace' && value === 'default')
	) {
		return '';
	}
	return value;
}

window.addEventListener('message', event => {
	/** @type {import('../src/webviews/createSourceWebview').MessageToWebview} */
	const message = event.data;

	switch(message.type) {
		case 'updateWebviewContent': {

			webviewTempState.isAzure = message.value.isAzure;
			webviewTempState.contextName = message.value.contextName;
			webviewTempState.clusterName = message.value.clusterName;
			webviewTempState.clusterProvider = message.value.clusterProvider;
			webviewTempState.isClusterProviderUserOverride = message.value.isClusterProviderUserOverride;

			if (webviewTempState.isAzure) {
				showAzureForm();
			} else {
				showGenericForm();
			}

			// Update headers
			$clusterName.textContent = `"${webviewTempState.clusterName}"`;
			if (message.value.clusterProvider !== 'Generic') {
				$clusteProviderHeader.textContent = `Cluster Provider: ${message.value.clusterProvider}${message.value.isClusterProviderUserOverride ? ' (User override)' : ''}`;
			}

			// set default values to source name/url/branch
			const $sourceName = /** @type null | HTMLInputElement */ (document.getElementById(webviewTempState.isAzure ? azureConfigurationNameId : fluxGitSourceNameId));
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

function showAzureGitForm() {
	$azureSourceBucketForm.hidden = true;
	$azureSourceGitForm.hidden = false;
}
function showAzureBucketForm() {
	$azureSourceGitForm.hidden = true;
	$azureSourceBucketForm.hidden = false;
}

postVSCodeMessage({
	type: 'webviewLoaded',
	value: true,
});
