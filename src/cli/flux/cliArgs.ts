import { paramCase } from 'change-case';
import shell from 'shell-escape-tag';

export function buildCLIArgs(data: any): string {
	let cli = '--timeout=5s';
	for (const [k, v] of Object.entries(data)) {
		if(v === '' || v === false) {
			continue;
		}

		const paramName = paramCase(k);
		if(v === true) {
			cli += ` --${paramName}`;
		} else {
			cli += shell` --${paramName}=${v}`;
		}
	}

	return cli;
}

export function cliKind(kind: string): string {
	switch(kind) {
		case 'GitRepository':
			return 'git';
		case 'OCIRepository':
			return 'oci';
		case 'HelmRepository':
			return 'helm';
		case 'Bucket':
			return 'bucker';
		default:
			return 'git';
	}
}

