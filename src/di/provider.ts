import { Container } from './container';
import { InjectToken } from './inject-token';

export interface Constructor<T> {
    new (...args: any[]): T;
};

export interface Service {
   destroy?: (...args: any[]) => any;
}

export interface ServiceClass<T extends Service = any> extends Constructor<T> {}

export interface Factory<T> {
    (...args: any[]): T;
}

export interface Provider<T extends Service> {
    create (container?: Container, parent?: InjectToken): T;
    destroy?: (...args: any[]) => any;
}

export interface ProviderClass<T> extends Constructor<Provider<T>> {
    dependencies?: (...args: any[]) => any;
}

export function isProviderClass<T> (fn: any): fn is ProviderClass<T> {
    return typeof fn === 'function' && typeof fn.prototype.create === 'function';
}
