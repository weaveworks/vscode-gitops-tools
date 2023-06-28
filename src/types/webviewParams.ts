import { GitInfo } from 'cli/git/gitInfo';
import { TemplateParam } from 'types/flux/gitOpsTemplate';
import { KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { ClusterInfo } from './kubernetes/clusterProvider';

export type ConfigureGitOpsWebviewParams = {
	clusterInfo: ClusterInfo;
	gitInfo: GitInfo | undefined;
	namespaces: string[];
	sources: KubernetesObject[];
	selectSourceTab: boolean;
	selectedSource: string;
	set: any;
};

export type CreateFromTemplateWebviewParams = {
	name?: string;
	namespace?: string;
	description?: string;
	folder: string;
	params: TemplateParam[];
};

export type WebviewParams = ConfigureGitOpsWebviewParams | CreateFromTemplateWebviewParams;

