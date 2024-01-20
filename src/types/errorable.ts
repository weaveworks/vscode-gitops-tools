export interface Succeeded<T> {
	readonly succeeded: true;
	readonly result: T;
}

export interface Failed {
	readonly succeeded: false;
	readonly error: string[];
}

export type Errorable<T> = Succeeded<T> | Failed;

export function succeeded<T>(e: Errorable<T>): e is Succeeded<T> {
	return e.succeeded;
}

export function failed<T>(e: Errorable<T>): e is Failed {
	return !e.succeeded;
}

export function result<T>(e: Errorable<T>): T | undefined {
	if (succeeded(e)) {
		return e.result;
	} else {
		return undefined;
	}
}

export async function aresult<T>(e: Promise<Errorable<T>>): Promise<T | undefined> {
	const r = await e;
	return result(r);
}

export function results<T>(es: Errorable<T>[]): (T | undefined)[] {
	return es.map(e => result(e));
}
