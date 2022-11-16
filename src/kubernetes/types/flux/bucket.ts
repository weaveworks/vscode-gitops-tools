import { Artifact, DeploymentCondition, KubernetesObject, KubernetesObjectKinds, ObjectMeta, ResultMetadata } from '../kubernetesTypes';

/**
 * Buckets result from running
 * `kubectl get Bucket -A` command.
 */
export interface BucketResult {
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.List;
	readonly items: Bucket[];
	readonly metadata: ResultMetadata;
}

/**
 * Bucket info object.
 */
export interface Bucket extends KubernetesObject {

	// standard kubernetes object fields
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.Bucket;
	readonly metadata: ObjectMeta;

	/**
	 * Bucket spec details.
	 *
	 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#bucketspec
	 */
	readonly spec: {

		/**
		 * The S3 compatible storage provider name, default ('generic')
		 */
		readonly provider?: string;

		/**
		 * The bucket name
		 */
		readonly bucketName: string;

		/**
		 *  The bucket endpoint address
		 */
		readonly endpoint: string;

		/**
		 * Insecure allows connecting to a non-TLS S3 HTTP endpoint
		 */
		readonly insecure?: boolean;

		/**
		 *  The bucket region
		 */
		readonly region?: string;

		/**
		 * The name of the secret containing authentication credentials for the Bucket
		 */
		readonly secretRef?: { name?: string; };

		/**
		 * The interval at which to check for bucket updates
		 */
		readonly interval: string;

		/**
		 * The timeout for download operations, defaults to 20s
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
	 * Bucket source status info.
	 *
	 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#bucketstatus
	 */
	readonly status: {

		/**
		 * ObservedGeneration is the last observed generation
		 */
		readonly observedGeneration?: number;

		/**
		 * Conditions holds the conditions for the Bucket
		 */
		readonly conditions?: DeploymentCondition[];

		/**
		 * URL is the download link for the artifact output of the last Bucket sync
		 */
	  readonly url?: string;

		/**
		 * Artifact represents the output of the last successful Bucket sync
		 */
		readonly artifact?: Artifact;

		/**
		 * LastHandledReconcileAt is the last manual reconciliation request
		 * (by annotating the Bucket) handled by the reconciler.
		 */
		readonly lastHandledReconcileAt?: string;
	};
}
