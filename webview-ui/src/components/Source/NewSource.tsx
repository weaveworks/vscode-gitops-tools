import NewGitRepository from './NewSource/NewGitRepository';
// import NewHelmRepository from './NewSource/NewHelmRepository';
// import NewOCI from './NewSource/NewOCI';

function NewSource() {
	return (
		<div>
			<vscode-panels aria-label="Type of source">
				<vscode-panel-tab>Git Repository</vscode-panel-tab>
				<vscode-panel-view>
					<NewGitRepository/>
				</vscode-panel-view>
			</vscode-panels>
		</div>
	);
}

export default NewSource;
