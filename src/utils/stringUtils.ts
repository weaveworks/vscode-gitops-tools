
/**
 * Shortens revision string for display in GitOps tree views.
 * @param revision Revision string to shorten.
 * @returns Short revision string with max 7 characters.
 */
export function shortenRevision(revision = ''): string {
	revision = revision.replace(/^(sha1|sha256|sha384|sha512|blake3):/, '');
	revision = revision.replace(/@(sha1|sha256|sha384|sha512|blake3):/, '/');
	if (revision.includes('/')) {
		// git revision includes branch name
		const [gitBranch, gitRevision] = revision.split('/');
		return [gitBranch, ':', gitRevision.slice(0, 7)].join('');
	} else {
		return revision.slice(0, 7);
	}
}

/**
 * Remove not allowed symbols, cast letters to lowercase
 * and truncate the string to match the RFC 1123 subdomain:
 *
 * - contain no more than 253 characters
 * - contain only lowercase alphanumeric characters, '-' or '.'
 * - start with an alphanumeric character
 * - end with an alphanumeric character
 * @param str string to sanitize
 */
export function sanitizeRFC1123(str: string): string {
	const notAllowedSymbolsRegex = /[^a-z0-9.-]/g;
	const notAllowedSymbolsAtTheStartRegex = /^[^a-z0-9]+/;
	const notAllowedSymbolsAtTheEndRegex = /[^a-z0-9]+$/;

	const lowercaseString = str.toLocaleLowerCase();

	const sanitizedString = lowercaseString
		.replace(notAllowedSymbolsRegex, '')
		.replace(notAllowedSymbolsAtTheStartRegex, '')
		.replace(notAllowedSymbolsAtTheEndRegex, '');

	return truncateString(sanitizedString, 253);
}

/**
 * Reduce the string length if it's longer than the allowed number of characters.
 * @param str string to truncate
 * @param maxChars maximum length of the string
 */
export function truncateString(str: string, maxChars: number): string {
	const chars = [...str];
	return chars.length > maxChars ? chars.slice(0, maxChars).join('') : str;
}
