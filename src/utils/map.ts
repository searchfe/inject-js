/**
 * ES6 Map 的部分实现，满足 Molecule 内部的需求
 * TODO
 *   * 搜索 polyfill 项目上线后，移除这个类
 */
export class Map {
  private _keys: any[] = []
  private _values: any[] = []

  set (key: any, value: any) {
      for (let i = 0; i < this._keys.length; i++) {
          if (this._keys[i] === key) {
              this._values[i] = value;
              return;
          }
      }
      this._keys.push(key);
      this._values.push(value);
  }

  get (key) {
      for (let i = 0; i < this._keys.length; i++) {
          if (this._keys[i] === key) return this._values[i];
      }
      return null;
  }

  clear () {
      this._keys = [];
      this._values = [];
  }

  keys (callbackFn) {
      return this._keys.forEach(callbackFn);
  }
}
