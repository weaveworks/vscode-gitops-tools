import { setGitOpsTemplate, GitOpsTemplate } from 'lib/model';

export function debug(str: string) {
	const e = document.getElementById('debug');
	if(e) {
		e.innerHTML = `${e.innerHTML}\n${str}`;
		// e.style.display = 'block';
		e.scrollTop = e.scrollHeight;
	}
}

export function debugStandalone() {
	const debugParams: GitOpsTemplate = {
		name: 'Template 001',
		description: 'Template001 description',
		folder: '/tmp',
		params: [{
			name: 'p1',
			options: ['o1', 'o2', 'o3'],
			default: 'o2',
		},
		{
			name: 'p2',
			default: 'defaultval',
		}],
	};


	setTimeout(() => {
		setGitOpsTemplate(debugParams);
	}, 300);
}
