import { Container } from '../di/container';
import { InjectToken } from '../di/inject-token';
import { RenderEngine } from '../render/engine';
import { ScopeOption, ScopeFactory } from '../utils/scope';
import { includes } from '../utils/includes';

/**
 * Module 模块
 * Module 描述了实现一个功能（一个Node下）所需要的所有依赖
 * Module 通过依赖注入的方式管理这些依赖
 *
 */
export class Module {
  protected container: Container = new Container()
  protected components: any[] = []
  protected modules: Module[] = []

  /** 内部方法，向容器添加provider */
  protected add (conf: ServiceProviderConf | FactoryProviderConf | ValueProviderConf | ProviderConf) {
      switch (conf.type) {
      case 'Service':
          this.container.addService(conf.service);
          break;
      case 'Factory':
          this.container.addFactory(conf.token, conf.fn, conf.deps);
          break;
      case 'Value':
          if (conf.override === false && includes(this.container.getTokens(), conf.token)) {
          /** 不覆盖 */
          } else {
              this.container.addValue(conf.token, conf.value);
          }
          break;
      case 'Provider':
          this.container.addProvider(conf.token, conf.provider);
          break;
      }
  }

  /** 设置MoleculeEngine 用于处理 create(modID) */
  public setEngine (token: 'MoleculeEngine' | 'SanEngine', engineProvider: any) {
      this.container.addProvider(token, engineProvider);
  }

  public setScope (option: ScopeOption) {
      this.add({
          type: 'Factory',
          token: 'Scope',
          fn: ScopeFactory(option),
          deps: []
      });
  }

  /** 创建molecule实例 */
  bootstrap (Component: Component): void
  bootstrap (modId: string): void
  bootstrap (): void
  bootstrap (molecule ? : Component | string) {
      if (molecule === undefined) {
          this.createMolecule();
      } else if (typeof molecule === 'string') {
          this.createMolecule(molecule);
      } else if (typeof molecule === 'function') {
          this.createComponent(molecule);
      }
  }

  private createComponent (Component: Component) {
      const token = Reflect.getMetadata('molecule:engine', Component);
      const option = Reflect.getMetadata('molecule:option', Component);
      if (token && includes(this.container.getTokens(), token)) {
          const engine: RenderEngine = this.container.create(token, this);
          engine.render(option, Component);
      } else {
          console.warn(`${token} not found when create Component`);
      }
  }

  private createMolecule (modId ? : string) {
      const Engine = this.container.getOrCreateProvider('MoleculeEngine');
      if (Engine) {
          const engine = this.container.create('MoleculeEngine', this);
          engine.render({
              modId: modId
          });
      } else {
          console.warn(`MoleculeEngine not found when create [${modId}]`);
      }
  }

  public destroy (...args: any[]) {
      this.container.getTokens().forEach(token => {
          const provider = this.container.getOrCreateProvider(token);
          const option = Reflect.getMetadata('molecule:destroyOption', provider.constructor);
          if (option && option.propertyKey) {
              try {
                  provider[option.propertyKey](...args);
              } catch (e) {
                  console.warn(e);
              }
          }
      });
      this.container.getServices().forEach(service => {
          const option = Reflect.getMetadata('molecule:destroyOption', service.constructor);
          if (option && option.propertyKey) {
              try {
                  service[option.propertyKey](...args);
              } catch (e) {
                  console.warn(e);
              }
          }
      });
  }
}

export type ServiceProviderConf = {
  type: 'Service',
  service: any,
  override ? : boolean
}

export type FactoryProviderConf = {
  type: 'Factory',
  token: InjectToken,
  fn: Function,
  deps: InjectToken[]
}

export type ValueProviderConf = {
  type: 'Value',
  token: InjectToken,
  value: any,
  override ? : boolean
}

export type ProviderConf = {
  type: 'Provider',
  token: InjectToken,
  provider: any
}

export type ProviderConfs = Array < ServiceProviderConf | FactoryProviderConf | ValueProviderConf | ProviderConf >

export interface Component {}

export function destroy (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('molecule:destroyOption', {
        propertyKey
    }, target.constructor);
}
