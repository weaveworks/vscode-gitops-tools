import { createSignal } from 'solid-js';
import { ReactiveMap } from '@solid-primitives/map';


export type TemplateParam = {
	name: string;
	description?: string;
	required?: boolean;
	options?: string[];
	default?: string;
};


export type GitOpsTemplate = {
	name?: string;
	namespace?: string;
	description?: string;
	params: TemplateParam[];
	folder?: string;
};

const t: GitOpsTemplate = {params: []};


export const [gitOpsTemplate, setGitOpsTemplate] = createSignal(t);
export const values = new ReactiveMap<string, string>();

