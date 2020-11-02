import { Provider } from './provider';
import { InjectToken } from './inject-token';
import { getDependencies } from './dependency';

export function createServiceProvider (Svc: { new(...args: any[]): any }) {
    return class ServiceProviderImpl implements Provider {
        instance: any = null
        args: any[]

        constructor (...args) {
            this.args = args;
        }
        create () {
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
