import { Component, destroy } from '../core/module';
import { RenderEngine, SelectorRenderEngine } from './engine';
import { provider } from '../decorators/provider';
import { inject } from '../decorators/inject';
import { Container } from '../di/container';
import { log } from '../utils/debug';
import { RootService } from '../utils/root';
import { Scope } from '../utils/scope';

/** SanMolecule 装饰器 用在san组件上可以实现molecule接口，可由SanRenderEngine渲染 */
export function san (componentOption: SanOption) {
    return function (target: any) {
        Reflect.defineMetadata('molecule:option', componentOption, target);
        Reflect.defineMetadata('molecule:engine', 'SanEngine', target);
    };
}

interface SanOption {
  selector: string
}

@provider
export class SanRenderEngineProvider {
    constructor (
    @inject('Log') protected log: log,
    @inject('Scope') protected scope: Scope,
    @inject('RootService') private rootService: RootService
    ) {}
    create (container: Container) {
        return new SanRenderEngine(container, this.log, this.scope, this.rootService);
    }
}

@provider
/** SanMolecule 渲染引擎 */
class SanRenderEngine extends SelectorRenderEngine implements RenderEngine {
  protected components: Component[] = []
  constructor (
    protected container: Container,
    protected log: log,
    protected scope: Scope,
    private rootService: RootService
  ) {
      super();
  }

  render (option: SanOption, Component: Component) {
      // const option = Reflect.getMetadata('molecule:option', Component).componentOption
      if (!option.selector) {
          this.log(`selector of ${Component} is not defined`);
          return;
      }
      const elements = this.select(option.selector);
      elements.forEach(element => {
          this.rootService.root = element;
          this.markRendered(element, true);
          const component = this.container.createMolecule(Component);
          if (component.attach) {
              component.attach(element);
              this.components.push(component);
          }
          this.log('[san-engine] component created');
      });
  }

  getComponents () {
      return this.components.slice();
  }

  @destroy
  destroy (...arg: any[]) {
      this.components.forEach(component => {
          const option = Reflect.getMetadata('molecule:destroyOption', component.constructor);
          if (option && option.propertyKey && typeof component[option.propertyKey] === 'function') {
              component[option.propertyKey](...arg);
          }
      });
  }
}
