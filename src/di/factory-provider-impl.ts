import { Provider, Service, ProviderClass, Factory } from './provider';
import { InjectToken } from './inject-token';
import { getDependencies } from './dependency';

export function createFactoryProvider<T extends Service> (factory: Factory<T>): ProviderClass<T> {
    return class FactoryProviderImpl implements Provider<T> {
        instance: T = null
        args: any[]

        constructor (...args) {
            this.args = args;
        }

        create (): T {
            if (!this.instance) {
                this.instance = factory(...this.args);
            }
            return this.instance;
        }

        destroy () {
            if (typeof this.instance.destroy === 'function') {
                this.instance.destroy();
            }
        }

        static dependencies (): InjectToken[] {
            return getDependencies(factory);
        }
    };
}
