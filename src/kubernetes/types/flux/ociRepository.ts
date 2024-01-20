import { Artifact, DeploymentCondition, KubernetesObject, KubernetesObjectKinds, LocalObjectReference, ObjectMeta, ResultMetadata } from '../kubernetesTypes';

/**
 * OCI repositories result from running
 * `kubectl get OCIRepository -A` command.
 */
export interface OCIRepositoryResult {
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.List;
	readonly items: OCIRepository[];
	readonly metadata: ResultMetadata;
}

/**
 * Helm repository info object.
 */
export interface OCIRepository extends KubernetesObject {

	// standard kubernetes object fields
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.OCIRepository;
	readonly metadata: ObjectMeta;

	/**
	 * Oci repository spec details.
	 *
	 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#ocirepositoryspec
	 */
	readonly spec: {

		/**
		 * URL is a reference to an OCI artifact repository hosted on a remote container registry.
		 */
		readonly url: string;

		/**
		 * OCIRepositoryRef defines the image reference for the OCIRepository’s URL
		 */
		readonly ref?: {
			/**
			 * Digest is the image digest to pull, takes precedence over SemVer.
			 * The value should be in the format ‘sha256:’.
			 */
			readonly digest?: string;

			/**
			 * SemVer is the range of tags to pull selecting the latest within
			 * the range, takes precedence over Tag.
			 */
			readonly semver?: string;

			/**
			 * Tag is the image tag to pull, defaults to latest.
			 */
			readonly tag?: string;
		};

		/**
		 * SecretRef contains the secret name containing the registry login
		 * credentials to resolve image metadata. The secret must be of type
		 * kubernetes.io/dockerconfigjson.
		 */
		readonly secretRef?: LocalObjectReference;

		/**
		 * ServiceAccountName is the name of the Kubernetes ServiceAccount
		 * used to authenticate the image pull if the service account has
		 * attached pull secrets.
		 */
		readonly serviceAccountName?: string;

		/**
		 * CertSecretRef can be given the name of a secret containing either or both of
     * * a PEM-encoded client certificate (certFile) and private key (keyFile);
     * * a PEM-encoded CA certificate (caFile)
     * and whichever are supplied, will be used for connecting to the registry.
		 */
		readonly certSecretRef?: LocalObjectReference;

		/**
		 * The interval at which to check the upstream for updates
		 */
		readonly interval: string;

		/**
		 * The timeout of index downloading, defaults to 60s
		 */
		readonly timeout?: string;

		/**
		 * Ignore overrides the set of excluded patterns in the .sourceignore format
		 * (which is the same as .gitignore). If not provided, a default will be used,
		 * consult the documentation for your version to find out what those are.
		 */
		readonly ignore?: string;

		/**
		 * This flag tells the controller to suspend the reconciliation of this source
		 */
		readonly suspend?: boolean;
	};

	/**
	 * OCI repository status info.
	 *
	 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#ocirepositorystatus
	 */
	readonly status: {

		/**
		 * ObservedGeneration is the last observed generation
		 */
		readonly observedGeneration?: number;

		/**
		 * Conditions holds the conditions for the HelmRepository
		 */
		readonly conditions?: DeploymentCondition[];

		/**
		 * URL is the download link for the last index fetched
		 */
		readonly url?: string;

		/**
		 * Artifact represents the output of the last successful repository sync
		 */
		readonly artifact?: Artifact;
	};
}
