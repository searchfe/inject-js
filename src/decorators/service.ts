import { Container } from '../di/container';
import { ServiceClass } from '../di/provider';

/**
 * 标明一个 Service，例如：
 *
 * @service(container)
 * class FooService {}
 *
 * 相当于：
 *
 * class FooService {}
 * container.addService(FooService)
 */
export function service (di: Container) {
    return function service (Fn: ServiceClass) {
        di.addService(Fn);
    };
}
