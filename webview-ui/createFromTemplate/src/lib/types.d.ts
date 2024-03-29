


// type StoreAccessor = {
// 	store?: 'source';
// 	field?: keyof (typeof source);
// } | {
// 	store: 'gitRepository';
// 	field: keyof (typeof gitRepository);
// } | {
// 	store: 'helmRepository';
// 	field: keyof (typeof helmRepository);
// } | {
// 	store: 'ociRepository';
// 	field: keyof (typeof ociRepository);
// } | {
// 	store: 'bucket';
// 	field: keyof (typeof bucket);
// } | {
// 	store: 'kustomization';
// 	field: keyof (typeof kustomization);
// };


// type InputProps = {
// 	class?: string;
// 	style?: string;
// 	type?: string;
// };

// type Children = {
// 	children?: any;
// }

// type ListItemProps = {
// 	items?: any;
// 	changed?: (a: any, b: any) => any;
// }

type ExplicitGetSet = {
	get?: () => any;
	set?: (v: any) => any;
};


export type ReactiveInputProps = ExplicitGetSet;
