import { sanitizeRFC1123 } from '../../utils/stringUtils';

/** RegEx to validate the resource name (except the length of the string) */
const RFC1123SubdomainRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

/**
 * Validate Kustomization name using RFC 1123 subdomain.
 * - In Azure max combined length of source + kustomization is 62 chars
 * - In flux - the max length of kustomization is 253 chars
 */
export function validateKustomizationName(kustomizationName: string, gitRepositoryName = '', isAzure: boolean) {

	let nameToValidate;

	if (isAzure) {
		nameToValidate = `${sanitizeRFC1123(gitRepositoryName || '')}-${  kustomizationName}`;
	} else {
		nameToValidate = kustomizationName;
	}

	if (isAzure && nameToValidate.length > 62) {
		return 'Invalid value: The combined length of the kustomization name plus the configuration name cannot exceed 62 characters.';
	}

	if (!isAzure && nameToValidate.length > 253) {
		return 'Invalid value: Maximum length is 253 characters.';
	}

	if (RFC1123SubdomainRegex.test(kustomizationName)) {
		return '';
	} else {
		return `Invalid value: "${kustomizationName}". A lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character.`;
	}
}
