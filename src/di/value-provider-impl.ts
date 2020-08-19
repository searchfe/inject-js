import { Provider } from './provider';
import { InjectToken } from './inject-token';

export function createValueProvider (value: any) {
    return class ValueProviderImpl implements Provider {
        public create () {
            return value;
        }
        public static dependencies (): InjectToken[] {
            return [];
        }
    };
}
