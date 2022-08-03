import { DeploymentCondition, KubernetesJSON, KubernetesObject, KubernetesObjectKinds, LocalObjectReference, ObjectMeta, ResultMetadata } from './kubernetesTypes';

/**
 * Kustomizations result from running
 * `kubectl get Kustomization -A` command.
 */
export interface TerraformResult {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: Terraform[];
	readonly metadata: ResultMetadata;
}

/**
 * Terraform API reference
 *
 * @see https://weaveworks.github.io/tf-controller/References/terraform/#infra.contrib.fluxcd.io/v1alpha1.Terraform
 */
export interface Terraform extends KubernetesObject {

	// standard kubernetes object fields
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.Terraform;
	readonly metadata: ObjectMeta;

	/**
	 * TerraformSpec defines the desired state of Terraform
	 *
	 * @see https://weaveworks.github.io/tf-controller/References/terraform/#infra.contrib.fluxcd.io/v1alpha1.TerraformSpec
	 */
	readonly spec: {

		/**
		 * ApprovePlan specifies name of a plan wanted to approve. If its value is “auto”,
		 * the controller will automatically approve every plan.
		 */
		readonly approvePlan?: string;

		/**
		 * Destroy produces a destroy plan. Applying the plan will destroy all resources.
		 */
		readonly destroy?: boolean;

		/**
		 * The interval at which to reconcile the Terraform
		 */
		readonly interval: string;

		/**
		 * The interval at which to retry a previously failed reconciliation.
		 * When not specified, the controller uses the TerraformSpec.Interval value
		 * to retry failures.
		 */
		readonly retryInterval?: string;

		/**
		 * Path to the directory containing Terraform (.tf) files.
		 * Defaults to ‘None’, which translates to the root path of the SourceRef.
		 */
		readonly path?: string;

		/**
		 * SourceRef is the reference of the source where the Terraform files
		 * are stored.
		 */
		 readonly sourceRef: NamespacedObjectKindReference;

		/**
		 * Name of a ServiceAccount for the runner Pod to provision Terraform
		 * resources. Default to tf-runner.
		 */
		readonly serviceAccountName?: string;

		/**
		 * Suspend is to tell the controller to suspend subsequent TF executions, it does
		 * not apply to already started executions. Defaults to false.
		 */
		readonly suspend?: boolean;

		/**
		 * TargetNamespace sets or overrides the namespace in the kustomization.yaml file
		 */
		readonly targetNamespace?: string;

		/**
		 * The timeout period at which the connection should timeout if unable to complete
		 * the request. When not specified, default 20s timeout is used.
		 */
		readonly timeout?: string;

		/**
		 * Force instructs the controller to unconditionally re-plan and re-apply TF
		 * resources. Defaults to false.
		 */
		readonly force?: boolean;
	};

	/**
	 * TerraformStatus defines the observed state of Terraform
	 *
	 * @see https://github.com/fluxcd/kustomize-controller/blob/main/docs/api/kustomize.md#kustomizationstatus
	 */
	readonly status: {
		/**
		 * ObservedGeneration is the last reconciled generation
		 */
		readonly observedGeneration?: number;

		/**
		 * The last successfully applied revision. The revision format for Git sources is
		 */
		readonly lastAppliedRevision?: string;

		/**
		 * LastAttemptedRevision is the revision of the last reconciliation attempt
		 */
		readonly lastAttemptedRevision?: string;
	};
}

export interface NamespacedObjectKindReference {

	/**
	 * API version of the referent
	 */
	readonly apiVersion?: string;

	/**
	 * Kind of the referent
	 */
	readonly kind: string;

	/**
	 * Name of the referent
	 */
	readonly name: string;

	/**
	 * Namespace of the referent, defaults to the Kustomization namespace
	 */
	readonly namespace?: string;
}

export interface KubeConfig {

	/**
	 * SecretRef holds the name to a secret that contains a ‘value’ key
	 * with the kubeconfig file as the value. It must be in the same namespace
	 * as the Kustomization. It is recommended that the kubeconfig is self-contained,
	 * and the secret is regularly updated if credentials such as
	 * a cloud-access-token expire. Cloud specific cmd-path auth helpers
	 * will not function without adding binaries and credentials to the Pod
	 * that is responsible for reconciling the Kustomization.
	 */
	readonly secretRef: LocalObjectReference;
}
