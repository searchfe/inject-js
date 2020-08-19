/**
 * 标明一个 Provider，例如：
 *
 */
export function provider (target: any) {
    Reflect.defineMetadata('molecule:option', { type: 'provider' }, target);
}
