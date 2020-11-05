import { Provider, Service, ServiceClass, ProviderClass } from './provider';
import { InjectToken } from './inject-token';
import { getDependencies } from './dependency';

export function createServiceProvider<T extends Service> (Svc: ServiceClass<T>): ProviderClass<T> {
    return class ServiceProviderImpl implements Provider<T> {
        instance: T = null
        args: any[]

        constructor (...args) {
            this.args = args;
        }
        create (): T {
            if (!this.instance) {
                this.instance = new Svc(...this.args);
            }
            return this.instance;
        }
        destroy () {
            if (typeof this.instance.destroy === 'function') {
                this.instance.destroy();
            }
        }
        static dependencies (): InjectToken[] {
            return getDependencies(Svc);
        }
    };
}
