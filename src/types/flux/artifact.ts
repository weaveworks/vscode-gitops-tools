/**
 * Artifact represents the output of a source synchronisation.
 */

export interface Artifact {

	/**
	 * Path is the relative file path of this artifact
	 */
	readonly path: string;

	/**
	 * URL is the HTTP address of this artifact
	 */
	readonly url: string;

	/**
	 * Revision is a human readable identifier traceable in the origin source system.
	 * It can be a Git commit SHA, Git tag, a Helm index timestamp,
	 * a Helm chart version, etc.
	 */
	readonly revision?: string;

	/**
	 * Checksum is the SHA1 checksum of the artifact
	 */
	readonly checksum?: string;

	/**
	 * LastUpdateTime is the timestamp corresponding to the last update of this artifact
	 */
	readonly lastUpdateTime: string;
}
