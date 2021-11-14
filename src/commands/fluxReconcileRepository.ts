import { fluxTools } from '../flux/fluxTools';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';

/**
 * Command to reconcile currently opened folder.
 */
export async function fluxReconcileRepository() {

	const gitRepositoryMetadata = await checkIfOpenedFolderGitRepositorySourceExists();
	if (!gitRepositoryMetadata) {
		return;
	}

	await fluxTools.reconcile('source git', gitRepositoryMetadata.gitRepositoryName, gitRepositoryMetadata.gitRepositoryNamespace);
}
