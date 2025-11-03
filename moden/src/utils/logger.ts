/* Simple logger wrapper that can be expanded later */
export const logger = {
	info: (...args: unknown[]) => console.log('[info]', ...args),
	warn: (...args: unknown[]) => console.warn('[warn]', ...args),
	error: (...args: unknown[]) => console.error('[error]', ...args),
};
