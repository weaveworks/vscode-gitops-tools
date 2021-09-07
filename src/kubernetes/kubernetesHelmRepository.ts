import { KubernetesArtifact, KubernetesDeploymentCondition, KubernetesLocalObjectReference, KubernetesObjectBase, KubernetesObjectMeta, ResultMetadata } from './kubernetesGeneralTypes';

export interface HelmRepositoryResult {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: HelmRepository[]
	readonly metadata: ResultMetadata;
}
export interface HelmRepository extends KubernetesObjectBase {
	readonly apiVersion: string;
	readonly kind: 'HelmRepository';
	readonly metadata: KubernetesObjectMeta;
	/** https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#helmrepositoryspec */
	readonly spec: {
		/** The Helm repository URL, a valid URL contains at least a protocol and host. */
		readonly url: string;
		/**
		 * The name of the secret containing authentication credentials for the Helm repository.
		 * For HTTP/S basic auth the secret must contain username and password fields.
		 * For TLS the secret must contain a certFile and keyFile, and/or caCert fields.
		 */
		readonly secretRef?: KubernetesLocalObjectReference;
		/**
		 * PassCredentials allows the credentials from the SecretRef
		 * to be passed on to a host that does not match the host as defined in URL.
		 * This may be required if the host of the advertised chart URLs in the index
		 * differ from the defined URL. Enabling this should be done with caution,
		 * as it can potentially result in credentials getting stolen in a MITM-attack.
		 */
		readonly passCredentials?: boolean;
		/** The interval at which to check the upstream for updates. */
		readonly interval: string;
		/** The timeout of index downloading, defaults to 60s. */
		readonly timeout?: string;
		/** This flag tells the controller to suspend the reconciliation of this source. */
		readonly suspend?: boolean;
	}
	/** https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#helmrepositorystatus */
	readonly status: {
		/** ObservedGeneration is the last observed generation. */
		readonly observedGeneration?: number;
		/** Conditions holds the conditions for the HelmRepository. */
		readonly conditions?: KubernetesDeploymentCondition[];
		/** URL is the download link for the last index fetched. */
		readonly url?: string;
		/** Artifact represents the output of the last successful repository sync. */
		readonly artifact?: KubernetesArtifact;

	}
}
