import { Provider } from './provider';
import { InjectToken } from './inject-token';

export function createValueProvider<T> (value: T) {
    return class ValueProviderImpl implements Provider<T> {
        public create (): T {
            return value;
        }
        public static dependencies (): InjectToken[] {
            return [];
        }
    };
}
