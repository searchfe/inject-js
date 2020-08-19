import { isProvider } from './provider';
import { createValueProvider } from './value-provider-impl';
import { createServiceProvider } from './service-provider-impl';
import { createFactoryProvider } from './factory-provider-impl';
import { Map } from '../utils/map';
import { InjectToken } from './inject-token';
import { getDependencies, setDependencies } from './dependency';
import { Root } from './builtin/root.service';

export class Container {
  private providers: Map
  private providerClasses: Map
  private services: any[] = [];

  constructor () {
      this.providers = new Map();
      this.providerClasses = new Map();
  }

  public getOrCreateProvider (fn: InjectToken) {
      let provider = this.providers.get(fn);
      if (provider) return provider;

      const ProviderClass = this.providerClasses.get(fn);
      if (!ProviderClass) {
          throw new Error(`provider for ${fn} not found`);
      }
      const deps = ProviderClass.dependencies().map(dep => this.create(dep, fn));
      provider = new ProviderClass(...deps);
      this.providers.set(fn, provider);
      return provider;
  }

  public create (fn: InjectToken, parent: InjectToken = null) {
      const provider = this.getOrCreateProvider(fn);
      const service = provider.create(this, parent);
      this.services.push(service);
      return service;
  }

  /** 待废弃下线的功能，请不要再新增引用，请使用addMolecule替代 */
  public bootstrap (el: any) {
      const name = el.getAttribute('m-name');
      const mole = this.create(`@molecule/${name}`);
      if (el.__molecule__) {
          return;
      }
      el.__molecule__ = mole;
      const deps = getDependencies(mole['default']);
      const Mole = mole['default'];
      return new Mole(...deps.map(dep => {
          if (dep === Root) {
              return el;
          }
          return this.create(dep);
      }));
  }

  public createMolecule (Mole: any) {
      const deps = getDependencies(Mole);
      return new Mole(...deps.map(dep => {
          return this.create(dep);
      }));
  }

  public addService (Svc: any) {
      const P = createServiceProvider(Svc);
      return this.addProvider(Svc, P);
  }

  public addFactory (token: InjectToken, f: Function, deps: InjectToken[]) {
      setDependencies(deps, f);
      const P = createFactoryProvider(f);
      return this.addProvider(token, P);
  }

  public addValue (token: InjectToken, value: any) {
      const P = createValueProvider(value);
      return this.addProvider(token, P);
  }

  public addProvider (token: InjectToken, P: any) {
      if (!isProvider(P)) {
          throw new Error(`invalid provider for "${token}"`);
      }
      if (!(<any>P).dependencies) {
          (<any>P).dependencies = () => getDependencies(P);
      }
      this.providerClasses.set(token, P);
  }

  public getTokens () {
      const tokens: InjectToken[] = [];
      this.providerClasses.keys(token => {
          tokens.push(token);
      });
      return tokens;
  }

  public getServices () {
      return this.services.slice();
  }
}
