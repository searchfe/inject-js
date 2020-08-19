import {
    provider
} from '../decorators/provider';

export function ScopeFactory (option: ScopeOption) {
    const scope = new ScopeRef();
    if (option.root) {
        scope.setRoot(option.root);
    }
    return () => {
        if (option.root) {
            scope.setRoot(option.root);
        }
        return scope;
    };
}

@provider
/** Scope 指定了一个Module模块内组件的的工作范围，并提供内部（非子模块）元素的查询器 */
export class ScopeRef implements Scope {
  private root: Element[] = []
  setRoot (rootOrSelector: Element[] | Element | string) {
      let root: Element[] = [];
      if (typeof rootOrSelector === 'string') {
          Array.prototype.forEach.call(document.querySelectorAll(rootOrSelector), function (ele) {
              root.push(ele);
          });
      } else if (Array.isArray(rootOrSelector)) {
          root = rootOrSelector as Element[];
      } else {
          root = [rootOrSelector] as Element[];
      }
      this.root.forEach(element => {
          element['__scope__'] = null;
      });
      this.root = root;

      this.root.forEach(element => {
          element['__scope__'] = this;
      });
  }
  querySelectorAll (selector: string, includeSelf: boolean = false) {
      const elements: Element[] = [];
      this.root.forEach(rootEle => {
          Array.prototype.forEach.call(rootEle.querySelectorAll(selector), function (ele) {
              if (inChildModule(ele, rootEle) === false) {
                  elements.push(ele);
              }
          });
          if (includeSelf) {
              if (rootEle.parentElement) {
                  Array.prototype.forEach.call(rootEle.parentElement.querySelectorAll(selector), function (ele) {
                      if (ele === rootEle) {
                          elements.push(ele);
                      }
                  });
              }
          }
      });
      return elements;
  }
  querySelector (selector: string, includeSelf: boolean = false) {
      /** 算法待改进 */
      const elements = this.querySelectorAll(selector, includeSelf);
      if (elements.length > 0) {
          return elements[0];
      } else {
          return null;
      }
  }
  forEach (callbackfn: (value: Element, index: number, array: Element[]) => void, thisArg ? : any) {
      return this.root.forEach(callbackfn, thisArg);
  }
}

export interface Scope {
  querySelectorAll: (selector: string, includeSelf ? : boolean) => Element[]
  querySelector: (selector: string, includeSelf ? : boolean) => Element | null
  forEach: (callbackfn: (value: Element, index: number, array: Element[]) => void, thisArg ? : any) => void
}

export interface ScopeOption {
  root ? : Element[] | Element | string
}

/** 传入一个element 和 预期module挂载的root，一直递归向上查找，如果该dom最近的module上级不是root，就返回false表明该element不属于当前module */
function inChildModule (el: (Element | any | null), root: Element) {
    if (el) {
        if (el['__scope__']) {
            if (el === root) {
                return false;
            }
            // el绑定了module，但不是当前
            return true;
        }
        return inChildModule(el.parentElement || el.parentNode, root);
    } else {
        return false;
    }
}
