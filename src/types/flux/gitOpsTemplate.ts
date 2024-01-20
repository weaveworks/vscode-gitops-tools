import { Kind, KubernetesObject } from 'types/kubernetes/kubernetesTypes';



export interface GitOpsTemplate extends KubernetesObject {
	readonly kind: Kind.GitOpsTemplate;

	readonly spec: {
		readonly params?: TemplateParam[];
		readonly description?: string;
	};

	readonly status?: any;
}

/**
 * params spec for GitOpsTempalte
 */
export interface TemplateParam {
	readonly name: string;
	readonly description: string;
	readonly options?: string[];
	readonly default?: string;
	readonly required?: boolean;
}


