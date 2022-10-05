/**
 * Keep autocomplete for the union type with `| string`.
 * https://github.com/microsoft/TypeScript/issues/29729
 */
export type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

export interface ParamsDictionary {
	[index: string]: any;
}