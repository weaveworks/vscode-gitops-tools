import { workspace } from 'vscode';
import { getGitRepositoryState, nameGitRepositorySource } from '../commands/createGitRepository';
import { ContextTypes, setContext } from '../context';
import { kubernetesTools } from '../kubernetes/kubernetesTools';

/**
 * Return the name of the Git Repository Source when the folder's git origin repository already exist
 * in the current cluster as a GitRepository Source, otherwise - return undefined.
 *
 * This function should be run:
 * - At extension startup
 * - Kubernetes current context is changed
 * - After git repository is added
 * - After git repository is deleted
 * - After disabling GitOps (git sources will be deleted)
 */
export async function checkIfOpenedFolderGitRepositorySourceExists() {

	const workspaceFolders = workspace.workspaceFolders;
	if (!workspaceFolders) {
		return;
	}

	const clusterGitRepositories = await kubernetesTools.getGitRepositories();

	let gitRepositoryExists = false;
	let gitRepositoryExistsName = '';
	let gitRepositoryExistsNamespace = '';

	for (const folder of workspaceFolders) {
		const gitRepositoryState = await getGitRepositoryState(folder.uri.fsPath, false);
		if (gitRepositoryState) {
			const gitRepositoryName = nameGitRepositorySource(gitRepositoryState.url, gitRepositoryState.branch);

			const foundGitRepository = clusterGitRepositories?.items.find(clusterGitRepo => clusterGitRepo.metadata.name === gitRepositoryName);
			if (foundGitRepository) {
				gitRepositoryExists = true;
				gitRepositoryExistsName = foundGitRepository.metadata.name || '';
				gitRepositoryExistsNamespace = foundGitRepository.metadata.namespace || '';
				break;
			}
		}
	}

	setContext(ContextTypes.OpenFolderGitRepositoryExist, gitRepositoryExists);
	setContext(ContextTypes.OpenFolderGitRepositoryExistDetermined, true);


	if (gitRepositoryExistsName && gitRepositoryExistsNamespace) {
		return {
			gitRepositoryName: gitRepositoryExistsName,
			gitRepositoryNamespace: gitRepositoryExistsNamespace,
		};
	}
}
