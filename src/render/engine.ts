import { Component } from '../core/module';
import { Scope } from '../utils/scope';

export interface RenderEngine {
  render: (option: any, component: Component) => void
  getComponents: () => Component[]
}

/** 提供select未初始化dom及mark已初始化dom的方法 */
export class SelectorRenderEngine {
  protected scope: Scope
  select (selector: string) {
      const elements: Element[] = [];
      Array.prototype.forEach.call(this.scope.querySelectorAll(selector, true), function (ele) {
          if (!ele['__molecule__']) {
              elements.push(ele);
          }
      });
      return elements;
  }
  protected markRendered (ele: Element, component: any) {
      ele['__molecule__'] = component;
  }
}
