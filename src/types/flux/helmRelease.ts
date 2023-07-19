import { Condition, Kind, KubernetesJSON, KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { DependsOn, KustomizationKubeConfig, Kustomization, NamespacedObjectKindReference } from './kustomization';

/**
 * Helm release info object.
 */
export interface HelmRelease extends KubernetesObject {
	readonly kind: Kind.HelmRelease;

	/**
	 * Helm release spec details.
	 *
	 * @see https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/#DeploymentSpec
	 * @see https://github.com/fluxcd/helm-controller/blob/main/docs/api/helmrelease.md#helmreleasespec
	 */
	readonly spec: {

		/**
		 * Chart defines the template of the v1beta1.HelmChart
		 * that should be created for this HelmRelease.
		 */
		readonly chart: HelmChartReleaseSpec;

		// Interval at which to reconcile the Helm release
		readonly interval: string;

		/**
		 * KubeConfig for reconciling the HelmRelease on a remote cluster.
		 * When specified, KubeConfig takes precedence over ServiceAccountName.
		 */
		readonly kubeConfig?: KustomizationKubeConfig;

		/**
		 * Suspend tells the controller to suspend reconciliation
		 * for this HelmRelease, it does not apply to already started
		 * reconciliations. Defaults to false.
		 */
		readonly suspend?: boolean;

		/**
		 * ReleaseName used for the Helm release.
		 * Defaults to a composition of ‘[TargetNamespace-]Name’.
		 */
		readonly releaseName?: string;

		/**
		 * TargetNamespace to target when performing operations for the HelmRelease.
		 * Defaults to the namespace of the HelmRelease.
		 */
		readonly targetNamespace?: string;

		/**
		 * StorageNamespace used for the Helm storage.
		 * Defaults to the namespace of the HelmRelease.
		 */
		readonly storageNamespace?: string;

		/**
		 * DependsOn may contain a dependency.CrossNamespaceDependencyReference slice
		 * with references to HelmRelease resources that must be ready
		 * before this HelmRelease can be reconciled.
		 */
		readonly dependsOn?: DependsOn;

		/**
		 * Timeout is the time to wait for any individual Kubernetes operation
		 * (like Jobs for hooks) during the performance of a Helm action.
		 * Defaults to ‘5m0s’.
		 */
		readonly timeout?: string;

		/**
		 * MaxHistory is the number of revisions saved by Helm for this HelmRelease.
		 * Use ‘0’ for an unlimited number of revisions; defaults to ‘10’.
		 */
		readonly maxHistory?: number;

		/**
		 * The name of the Kubernetes service account to impersonate
		 * when reconciling this HelmRelease.
		 */
		readonly serviceAccountName?: string;

		/**
		 * Install holds the configuration for Helm install actions for this HelmRelease
		 */
		readonly install?: Install;

		/**
		 * Upgrade holds the configuration for Helm upgrade actions for this HelmRelease
		 */
		readonly upgrade?: Upgrade;

		/**
		 * Test holds the configuration for Helm test actions for this HelmRelease
		 */
		readonly test?: Test;

		/**
		 * Rollback holds the configuration for Helm rollback actions for this HelmRelease
		 */
		readonly rollback?: Rollback;

		/**
		 * Uninstall holds the configuration for Helm uninstall actions for this HelmRelease
		 */
		readonly uninstall?: Uninstall;

		/**
		 * ValuesFrom holds references to resources containing Helm values
		 * for this HelmRelease, and information about how they should be merged.
		 */
		readonly valuesFrom?: ValuesReference;

		/**
		 * Values holds the values for this Helm release
		 */
		readonly values?: KubernetesJSON;

		/**
		 * PostRenderers holds an array of Helm PostRenderers,
		 * which will be applied in order of their definition.
		 */
		readonly postRenderers?: PostRenderer[];
	};

	/**
	 * Helm release status.
	 *
	 * @see https://github.com/fluxcd/helm-controller/blob/main/docs/api/helmrelease.md#helmreleasestatus
	 */
	readonly status: {

		/**
		 * ObservedGeneration is the last observed generation
		 */
		readonly observedGeneration?: number;

		/**
		 * Conditions holds the conditions for the HelmRelease
		 */
		readonly conditions?: Condition;

		/**
		 * LastAppliedRevision is the revision of the last successfully applied source
		 */
		readonly lastAppliedRevision?: string;

		/**
		 * LastAttemptedRevision is the revision of the last reconciliation attempt
		 */
		readonly lastAttemptedRevision?: string;

		/**
		 * LastAttemptedValuesChecksum is the SHA1 checksum
		 * of the values of the last reconciliation attempt.
		 */
		readonly lastAttemptedValuesChecksum?: string;

		/**
		 * LastReleaseRevision is the revision of the last successful Helm release
		 */
		readonly lastReleaseRevision?: number;

		/**
		 * HelmChart is the namespaced name of the HelmChart resource
		 * created by the controller for the HelmRelease.
		 */
		readonly helmChart?: string;

		/**
		 * Failures is the reconciliation failure count against the latest desired state.
		 * It is reset after a successful reconciliation.
		 */
		readonly failures?: number;

		/**
		 * InstallFailures is the install failure count against the latest desired state.
		 * It is reset after a successful reconciliation.
		 */
		readonly installFailures?: number;

		/**
		 * UpgradeFailures is the upgrade failure count against the latest desired state.
		 * It is reset after a successful reconciliation.
		 */
		readonly upgradeFailures?: number;
	};
}

/**
 * Spec holds the template for the v1beta1.HelmChartSpec for this HelmRelease.
 *
 * @see https://github.com/fluxcd/helm-controller/blob/main/docs/api/helmrelease.md#helm.toolkit.fluxcd.io/v2beta1.HelmChartTemplate
 */
interface HelmChartReleaseSpec {

	readonly spec: {

		/**
		 * The name or path the Helm chart is available at in the SourceRef
		 */
		readonly chart: string;

		/**
		 * Version semver expression, ignored for charts from
		 * v1beta1.GitRepository and v1beta1.Bucket sources.
		 * Defaults to latest when omitted.
		 */
		readonly version?: string;

		/**
		 * The name and namespace of the v1beta1.Source the chart is available at
		 */
		readonly sourceRef: NamespacedObjectKindReference;

		/**
		 * Interval at which to check the v1beta1.Source for updates.
		 * Defaults to ‘HelmReleaseSpec.Interval’.
		 */
		readonly interval?: string;

		/**
		 * Alternative list of values files to use as the chart values
		 * (values.yaml is not included by default), expected to be a relative path
		 * in the SourceRef.
		 * Values files are merged in the order of this list
		 * with the last file overriding the first. Ignored when omitted.
		 */
		readonly valuesFiles?: string[];

		/**
		 * Alternative values file to use as the default chart values,
		 * expected to be a relative path in the SourceRef.
		 * Deprecated in favor of ValuesFiles, for backwards compatibility
		 * the file defined here is merged before the ValuesFiles items.
		 * Ignored when omitted.
		 */
		readonly valuesFile?: string;
	};
}

/**
 * @see https://github.com/fluxcd/helm-controller/blob/main/docs/api/helmrelease.md#install
 */
interface Install {

	/**
	 * Timeout is the time to wait for any individual Kubernetes operation
	 * (like Jobs for hooks) during the performance of a Helm install action.
	 * Defaults to ‘HelmReleaseSpec.Timeout’.
	 */
	readonly timeout?: string;

	/**
	 * Remediation holds the remediation configuration
	 * for when the Helm install action for the HelmRelease fails.
	 * The default is to not perform any action.
	 */
	readonly remediation?: Remediation;

	/**
	 * DisableWait disables the waiting for resources to be ready
	 * after a Helm install has been performed.
	 */
	readonly disableWait?: boolean;

	/**
	 * DisableWaitForJobs disables waiting for jobs to complete
	 * after a Helm install has been performed.
	 */
	readonly disableWaitForJobs?: boolean;

	/**
	 * DisableHooks prevents hooks from running during the Helm install action.
	 */
	readonly disableHooks?: boolean;

	/**
	 * DisableOpenAPIValidation prevents the Helm install action
	 * from validating rendered templates against the Kubernetes OpenAPI Schema.
	 */
	readonly disableOpenAPIValidation?: boolean;

	/**
	 * Replace tells the Helm install action to re-use the ‘ReleaseName’,
	 * but only if that name is a deleted release which remains in the history.
	 */
	readonly replace?: boolean;

	/**
	 * SkipCRDs tells the Helm install action to not install any CRDs.
	 * By default, CRDs are installed if not already present.
	 * Deprecated use CRD policy (`crds`) attribute with value `Skip` instead.
	 */
	readonly skipCRDs?: boolean;

	/**
	 * CRDs upgrade CRDs from the Helm Chart’s crds directory according
	 * to the CRD upgrade policy provided here.
	 * Valid values are Skip, Create or CreateReplace.
	 * Default is Create and if omitted CRDs are installed but not updated.
	 * Skip: do neither install nor replace (update) any CRDs.
	 * Create: new CRDs are created, existing CRDs are neither updated nor deleted.
	 * CreateReplace: new CRDs are created, existing CRDs are updated (replaced) but not deleted.
	 * By default, CRDs are applied (installed) during Helm install action.
	 * With this option users can opt-in to CRD replace existing CRDs on Helm install actions,
	 * which is not (yet) natively supported by Helm.
	 * @see https://helm.sh/docs/chart_best_practices/custom_resource_definitions.
	 */
	readonly crds?: string;

	/**
	 * CreateNamespace tells the Helm install action to create
	 * the HelmReleaseSpec.TargetNamespace if it does not exist yet.
	 * On uninstall, the namespace will not be garbage collected.
	 */
	readonly createNamespace?: boolean;
}

/**
 * @see https://github.com/fluxcd/helm-controller/blob/main/docs/api/helmrelease.md#upgrade
 */
interface Upgrade {

	/**
	 * Timeout is the time to wait for any individual Kubernetes operation
	 * (like Jobs for hooks) during the performance of a Helm install action.
	 * Defaults to ‘HelmReleaseSpec.Timeout’.
	 */
	readonly timeout?: string;

	/**
	 * Remediation holds the remediation configuration
	 * for when the Helm install action for the HelmRelease fails.
	 * The default is to not perform any action.
	 */
	readonly remediation?: Remediation;

	/**
	 * DisableWait disables the waiting for resources to be ready
	 * after a Helm install has been performed.
	 */
	readonly disableWait?: boolean;

	/**
	 * DisableWaitForJobs disables waiting for jobs to complete
	 * after a Helm install has been performed.
	 */
	readonly disableWaitForJobs?: boolean;

	/**
	 * DisableHooks prevents hooks from running during the Helm install action
	 */
	readonly disableHooks?: boolean;

	/**
	 * DisableOpenAPIValidation prevents the Helm install action
	 * from validating rendered templates against the Kubernetes OpenAPI Schema.
	 */
	readonly disableOpenAPIValidation?: boolean;

	/**
	 * Force forces resource updates through a replacement strategy
	 */
	readonly force?: boolean;

	/**
	 * PreserveValues will make Helm reuse the last
	 * release’s values and merge in overrides from ‘Values’.
	 * Setting this flag makes the HelmRelease non-declarative.
	 */
	readonly preserveValues?: boolean;

	/**
	 * CleanupOnFail allows deletion of new resources created
	 * during the Helm upgrade action when it fails.
	 */
	readonly cleanupOnFail?: boolean;

	/**
	 * CRDs upgrade CRDs from the Helm Chart’s crds directory according
	 * to the CRD upgrade policy provided here.
	 * Valid values are Skip, Create or CreateReplace.
	 * Default is Create and if omitted CRDs are installed but not updated.
	 * Skip: do neither install nor replace (update) any CRDs.
	 * Create: new CRDs are created, existing CRDs are neither updated nor deleted.
	 * CreateReplace: new CRDs are created, existing CRDs are updated (replaced) but not deleted.
	 * By default, CRDs are applied (installed) during Helm install action.
	 * With this option users can opt-in to CRD replace existing CRDs on Helm install actions,
	 * which is not (yet) natively supported by Helm.
	 * https://helm.sh/docs/chart_best_practices/custom_resource_definitions.
	 */
	readonly crds?: string;
}

/**
 * @see https://github.com/fluxcd/helm-controller/blob/main/docs/api/helmrelease.md#uninstall
 */
interface Uninstall {

	/**
	 * Timeout is the time to wait for any individual Kubernetes operation
	 * (like Jobs for hooks) during the performance of a Helm uninstall action.
	 * Defaults to ‘HelmReleaseSpec.Timeout’.
	 */
	timeout?: string;

	/**
	 * DisableHooks prevents hooks from running during the Helm rollback action.
	 */
	disableHooks?: boolean;

	/**
	 * KeepHistory tells Helm to remove all associated resources
	 * and mark the release as deleted, but retain the release history.
	 */
	keepHistory?: boolean;
}

/**
 * @see https://github.com/fluxcd/helm-controller/blob/main/docs/api/helmrelease.md#test
 */
interface Test {

	/**
	 * Enable enables Helm test actions for this HelmRelease
	 * after an Helm install or upgrade action has been performed.
	 */
	enable?: boolean;

	/**
	 * Timeout is the time to wait for any individual Kubernetes operation
	 * during the performance of a Helm test action.
	 * Defaults to ‘HelmReleaseSpec.Timeout’.
	 */
	timeout?: string;

	/**
	 * IgnoreFailures tells the controller to skip remediation
	 * when the Helm tests are run but fail.
	 * Can be overwritten for tests run after install or
	 * upgrade actions in ‘Install.IgnoreTestFailures’ and ‘Upgrade.IgnoreTestFailures’.
	 */
	ignoreFailures?: boolean;
}

/**
 * @see https://github.com/fluxcd/helm-controller/blob/main/docs/api/helmrelease.md#rollback
 */
interface Rollback {

	/**
	 * Timeout is the time to wait for any individual
	 * Kubernetes operation (like Jobs for hooks) during the performance
	 * of a Helm rollback action.
	 * Defaults to ‘HelmReleaseSpec.Timeout’.
	 */
	timeout?: string;

	/**
	 * DisableWait disables the waiting for resources to be ready
	 * after a Helm rollback has been performed.
	 */
	disableWait?: boolean;

	/**
	 * DisableWaitForJobs disables waiting for jobs to complete
	 * after a Helm rollback has been performed.
	 */
	disableWaitForJobs?: boolean;

	/**
	 * DisableHooks prevents hooks from running during the Helm rollback action
	 */
	disableHooks?: boolean;

	/**
	 * Recreate performs pod restarts for the resource if applicable
	 */
	recreate?: boolean;

	/**
	 * Force forces resource updates through a replacement strategy
	 */
	force?: boolean;

	/**
	 * CleanupOnFail allows deletion of new resources
	 * created during the Helm rollback action when it fails.
	 */
	cleanupOnFail?: boolean;
}

interface Remediation {

	/** Retries is the number of retries that should be attempted
	 * on failures before bailing. Remediation, using an uninstall,
	 * is performed between each attempt. Defaults to ‘0’,
	 * a negative integer equals to unlimited retries.
	 */
	readonly retries?: number;

	/**
	 * IgnoreTestFailures tells the controller to skip remediation
	 * when the Helm tests are run after an install action but fail.
	 * Defaults to ‘Test.IgnoreFailures’.
	 */
	readonly ignoreTestFailures?: boolean;

	/**
	 * RemediateLastFailure tells the controller to remediate
	 * the last failure, when no retries remain.
	 * Defaults to ‘false’.
	 */
	readonly remediateLastFailure?: boolean;
}

interface ValuesReference {

	/**
	 * Kind of the values referent, valid values are (‘Secret’, ‘ConfigMap’)
	 */
	readonly kind: string;

	/**
	 * Name of the values referent.
	 * Should reside in the same namespace as the referring resource.
	 */
	readonly name: string;

	/**
	 * ValuesKey is the data key where the values.yaml
	 * or a specific value can be found at.
	 * Defaults to ‘values.yaml’.
	 */
	readonly valuesKey?: string;

	/**
	 * TargetPath is the YAML dot notation path the value should be merged at.
	 * When set, the ValuesKey is expected to be a single flat value. Defaults to ‘None’,
	 * which results in the values getting merged at the root.
	 */
	readonly targetPath?: string;

	/**
	 * Optional marks this ValuesReference as optional.
	 * When set, a not found error for the values reference is ignored,
	 * but any ValuesKey, TargetPath or transient error will still result in a reconciliation failure.
	 */
	readonly optional?: boolean;
}

interface PostRenderer {
	/**
	 * Kustomization to apply as PostRenderer
	 */
	readonly kustomize: {
		readonly patchesStrategicMerge?: Kustomization['spec']['patchesStrategicMerge'];
		readonly patchesJson6902?: Kustomization['spec']['patchesJson6902'];
		readonly images?: Kustomization['spec']['images'];
	};
}
