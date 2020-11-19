import { ServiceClass } from './provider';
/**
 * 用来在一个容器实例内，唯一标识一个 Provider
 */
let id = 0;

class Token<T> {
    private readonly __id__ = ++id;
}

export type InjectToken<T = any> = Token<T> | ServiceClass<T>;

export function createInjectToken<T = any> (): InjectToken<T> {
    return new Token<T>();
}
