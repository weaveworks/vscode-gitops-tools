/**
 * Return the first 7 symbols of SHA.
 * Git SHA includes the branch name.
 */
export function shortenRevision(sha = ''): string {
	if (sha.includes('/')) {
		const [gitBranch, gitSha] = sha.split('/');
		return [gitBranch, '/', gitSha.slice(0, 7)].join('');
	} else {
		return sha.slice(0, 7);
	}
}
