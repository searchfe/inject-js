import { InjectToken } from './inject-token';

export function setDependencies (deps: InjectToken[], fn: InjectToken) {
    Reflect.defineMetadata('design:paramtypes', deps, fn);
}

export function setNthDependency (dep: InjectToken, nth: number, fn: InjectToken) {
    const key = 'design:paramtokens:' + nth;
    Reflect.defineMetadata(key, dep, fn);
}

export function getDependencies (fn: InjectToken) {
    const deps = Reflect.getMetadata('design:paramtypes', fn) || [];
    const ret = [];
    for (let i = 0; i < deps.length; i++) {
        const token = Reflect.getMetadata('design:paramtokens:' + i, fn);
        ret.push(token || deps[i]);
    }
    return ret;
}
