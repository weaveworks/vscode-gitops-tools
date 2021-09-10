/**
 * Shortens revision string for display in GitOps tree views.
 * @param revision Revision string to shorten.
 * @returns Short revision string with max 7 characters.
 */
export function shortenRevision(revision: string = ''): string {
	if (revision.includes('/')) {
		// git revision includes branch name
		const [gitBranch, gitRevision] = revision.split('/');
		return [gitBranch, '/', gitRevision.slice(0, 7)].join('');
	}
	else {
		return revision.slice(0, 7);
	}
}
