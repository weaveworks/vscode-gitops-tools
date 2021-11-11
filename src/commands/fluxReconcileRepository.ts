import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { reconcileSource } from './fluxReconcileSource';

/**
 * Command to reconcile currently opened folder.
 */
export async function fluxReconcileRepository() {

	const gitRepositoryMetadata = await checkIfOpenedFolderGitRepositorySourceExists();
	if (!gitRepositoryMetadata) {
		return;
	}

	reconcileSource('git', gitRepositoryMetadata.gitRepositoryName, gitRepositoryMetadata.gitRepositoryNamespace);
}
