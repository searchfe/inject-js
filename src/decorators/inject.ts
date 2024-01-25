import { InjectToken } from '../di/inject-token';
import { setNthDependency } from '../di/dependency';

/**
 * 声明参数的 token
 */
export function inject (token: InjectToken) {
    return function inject (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
        if (propertyKey === undefined) {
            setNthDependency(token, parameterIndex, target);
        }
    };
}
