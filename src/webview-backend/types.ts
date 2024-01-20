import { GitInfo } from '../git/gitInfo';
import { GitOpsTemplate, TemplateParam } from '../kubernetes/types/flux/gitOpsTemplate';
import { ClusterInfo, KubernetesObject } from '../kubernetes/types/kubernetesTypes';

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

