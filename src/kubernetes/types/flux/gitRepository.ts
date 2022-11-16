import { Artifact, DeploymentCondition, KubernetesObject, KubernetesObjectKinds, LocalObjectReference, ObjectMeta, ResultMetadata } from '../kubernetesTypes';

/**
 * Git repositories result from running
 * `kubectl get GitRepository -A` command.
 */
export interface GitRepositoryResult {
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.List;
	readonly items: GitRepository[];
	readonly metadata: ResultMetadata;
}

/**
 * Git repository info object.
 */
export interface GitRepository extends KubernetesObject {

	// standard kubernetes object fields
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.GitRepository;
	readonly metadata: ObjectMeta;

	/**
	 * Git repository spec details.
	 *
	 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#gitrepositoryspec
	 */
	readonly spec: {

		/**
		 * The repository URL, can be a HTTP/S or SSH address
		 */
		readonly url: string;

		/**
		 * The secret name containing the Git credentials.
		 * For HTTPS repositories the secret must contain username and password fields.
		 * For SSH repositories the secret must contain identity, identity.pub and known_hosts fields.
		 */
		readonly secretRef?: LocalObjectReference;

		/**
		 * The interval at which to check for repository updates
		 */
		readonly interval: string;

		/**
		 * The timeout for remote Git operations like cloning, defaults to 20s
		 */
		readonly timeout?: string;

		/**
		 * The Git reference to checkout and monitor for changes, defaults to master branch
		 */
		readonly ref?: GitRepositoryRef;

		/**
		 * Verify OpenPGP signature for the Git commit HEAD points to
		 */
		readonly verify?: GitRepositoryVerification;

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

		/**
		 * Determines which git client library to use.
		 * Defaults to go-git, valid values are ('go-git', 'libgit2').
		 */
		readonly gitImplementation?: string;

		/**
		 * When enabled, after the clone is created, initializes all submodules within.
		 * This option is available only when using the 'go-git' GitImplementation.
		 */
		readonly recurseSubmodules?: boolean;

		/**
		 * Extra git repositories to map into the repository
		 */
		readonly include?: GitRepositoryInclude[];
	};

	/**
	 * Git repository source status info.
	 *
	 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#gitrepositorystatus
	 */
	readonly status: {

		/**
		 * ObservedGeneration is the last observed generation
		 */
		readonly observedGeneration?: number;

		/**
		 * Conditions holds the conditions for the GitRepository
		 */
		readonly conditions?: DeploymentCondition[];

		/**
		 * URL is the download link for the artifact output of the last repository sync
		 */
		readonly url?: string;

		/**
		 * Artifact represents the output of the last successful repository sync
		 */
		readonly artifact?: Artifact;
	};
}

/**
 * GitRepositoryRef defines the Git ref used for pull and checkout operations.
 *
 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#gitrepositoryref
 */
interface GitRepositoryRef {

	/**
	 * The Git branch to checkout, defaults to master
	 */
	readonly branch?: string;

	/**
	 * The Git tag to checkout, takes precedence over Branch
	 */
	readonly tag?: string;

	/**
	 * The Git tag semver expression, takes precedence over Tag
	 */
	readonly semver?: string;

	/**
	 * The Git commit SHA to checkout, if specified Tag filters will be ignored
	 */
	readonly commit?: string;
}

/**
 * GitRepositoryVerification defines the OpenPGP signature verification process.
 *
 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#gitrepositoryverification
 */
interface GitRepositoryVerification {

	/**
	 * Mode describes what git object should be verified, currently (‘head’)
	 */
	readonly mode: string;

	/**
	 * The secret name containing the public keys of all trusted Git authors
	 */
	readonly secretRef: LocalObjectReference;
}

/**
 * GitRepositoryInclude defines a source with a from and to path.
 *
 * @see https://github.com/fluxcd/source-controller/blob/main/docs/api/source.md#gitrepositoryinclude
 */
interface GitRepositoryInclude {

	/**
	 * Reference to a GitRepository to include
	 */
	readonly repository: LocalObjectReference;

	/**
	 * The path to copy contents from, defaults to the root directory
	 */
	readonly fromPath?: string;

	/**
	 * The path to copy contents to, defaults to the name of the source ref
	 */
	readonly toPath?: string;
}
