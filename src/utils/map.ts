import { includes } from './array';

/**
 * ES6 Map 的部分实现
 */
export class Map<KeyType, ValueType> {
    private _keys: KeyType[] = []
    private _values: ValueType[] = []

    set (key: KeyType, value: ValueType) {
        for (let i = 0; i < this._keys.length; i++) {
            if (this._keys[i] === key) {
                this._values[i] = value;
                return;
            }
        }
        this._keys.push(key);
        this._values.push(value);
    }

    get (key: KeyType): ValueType | undefined {
        for (let i = 0; i < this._keys.length; i++) {
            if (this._keys[i] === key) return this._values[i];
        }
    }

    has (key: KeyType): boolean {
        return includes(this._keys, key);
    }

    clear () {
        this._keys = [];
        this._values = [];
    }

    keys () {
        return this._keys;
    }

    values () {
        return this._values;
    }
}

export function increase<T> (map: Map<T, any>, key: T) {
    const degree = (map.get(key) || 0) + 1;
    map.set(key, degree);
    return degree;
}

export function decrease<T> (map: Map<T, any>, key: T) {
    const degree = (map.get(key) || 0) - 1;
    map.set(key, degree);
    return degree;
}
