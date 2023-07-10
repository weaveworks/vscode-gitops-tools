
/**
 * Resolve the promise with a delay.
 * @param ms delay in milliseconds
 */
export async function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// small timestamp for debug
export function ts() {
	return Date().slice(19, 24);
}
