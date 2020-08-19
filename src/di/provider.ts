import { Container } from './container';
import { InjectToken } from './inject-token';

export interface Service {}

export type factory = (...args: any[]) => any

export interface Provider {
  create (container: Container, parent: InjectToken)
}

export function isProvider (fn: any): fn is Provider {
    return typeof fn === 'function' && typeof fn.prototype.create === 'function';
}
