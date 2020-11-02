import { Provider } from './provider';
import { InjectToken } from './inject-token';
import { getDependencies } from './dependency';

export function createFactoryProvider (factory: Function) {
    return class FactoryProviderImpl implements Provider {
        instance: any = null
        args: any[]

        constructor (...args) {
            this.args = args;
        }

        create () {
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
