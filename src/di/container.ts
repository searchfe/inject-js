import { isProviderClass, Service, ProviderClass, ServiceClass, Factory } from './provider';
import { createValueProvider } from './value-provider-impl';
import { createServiceProvider } from './service-provider-impl';
import { createFactoryProvider } from './factory-provider-impl';
import { Map } from '../utils/map';
import { InjectToken } from './inject-token';
import { getDependencies, setDependencies } from './dependency';

/**
 * 依赖注入容器
 *
 * 根据控制反转的概念： [Inversion of Control](https://en.wikipedia.org/wiki/Inversion_of_control) (IoC)，Container 作为控制反转的容器，当你给容器提供一个 token 时，容器会自动的根据这个 token 值去注入对应的依赖，而这需要 `@inject` 和 `@injectable` 去生成 metadata。
 */
export class Container {
    private providers: Map
    private providerClasses: Map
    private services: Service[] = [];
    private prerequisites: any[][] = [];
    public childContainers: Container[] = [];
    public parent?: Container;

    constructor (parent?: Container) {
        this.parent = parent;
        this.providers = new Map();
        this.providerClasses = new Map();
    }

    public createChildContainer () {
        const childContainer = new Container(this);
        this.childContainers.push(childContainer);
        return childContainer;
    }

    public getOrCreateProvider (fn: InjectToken) {
        let provider = this.providers.get(fn);
        if (provider) return provider;

        const ProviderClass = this.providerClasses.get(fn);
        if (!ProviderClass) {
            if (!this.parent) throw new Error(`provider for ${fn} not found`);
            return this.parent.getOrCreateProvider(fn);
        }
        const deps = ProviderClass.dependencies().map(dep => {
            // 先决数组中不包括父容器的provider
            this.providerClasses.get(dep) && this.prerequisites.push([fn, dep]);
            return this.create(dep, fn);
        });
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

    /**
     * 为该容器注册一个 Service Class，它的依赖会被自动解决，inject-js 也会创建它的实例注入给别人。
     */
    public addService<T> (Svc: ServiceClass<T>) {
        const P = createServiceProvider<T>(Svc);
        return this.addProvider(Svc, P);
    }

    /**
     * 为该容器注册一个 Factory，即可以返回 Service 实例的函数。
     */
    public addFactory<T> (token: InjectToken<T>, f: Factory<T>, deps: InjectToken[]) {
        setDependencies(deps, f);
        const P = createFactoryProvider<T>(f);
        return this.addProvider(token, P);
    }

    /**
     * 为该容器注册一个具体的值。可以是一个类的实例，也可以是基本类型。通常标识容器的一些配置。
     */
    public addValue<T> (token: InjectToken<T>, value: T) {
        const P = createValueProvider<T>(value);
        return this.addProvider(token, P);
    }

    /**
     * 为该容器注册一个 provider，每个 provider 需要提供 create 初始化方法，返回该 provider 注入的依赖。
     */
    public addProvider<T> (token: InjectToken<T>, P: ProviderClass<T>) {
        if (!isProviderClass(P)) {
            throw new Error(`invalid provider for "${token}"`);
        }
        if (!P.dependencies) {
            P.dependencies = () => getDependencies(P);
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

    public getSortedList () {
        const inDegree = new Map();
        const graph = new Map();
        this.providers.keys((key) => inDegree.set(key, 0));
        // 生成入度map和哈希表
        for (let i = 0; i < this.prerequisites.length; i++) {
            const degreeVal: number = inDegree.get(this.prerequisites[i][0]);
            inDegree.set(this.prerequisites[i][0], degreeVal + 1);
            if (graph.get(this.prerequisites[i][1])) {
                const nowGraph = graph.get(this.prerequisites[i][1]);
                nowGraph.push(this.prerequisites[i][0]);
                graph.set(this.prerequisites[i][1], nowGraph);
            } else {
                graph.set(this.prerequisites[i][1], [this.prerequisites[i][0]]);
            }
        }
        const result = [];
        const queue = [];
        inDegree.keys((key) => {
            if (inDegree.get(key) === 0) {
                queue.push(key);
            }
        });
        while (queue.length) {
            const cur = queue.shift();
            result.push(cur);
            const toEnQueue = graph.get(cur);
            if (toEnQueue && toEnQueue.length) {
                for (let i = 0; i < toEnQueue.length; i++) {
                    const inDegreeVal = inDegree.get(toEnQueue[i]);
                    if (inDegreeVal === 1) {
                        queue.push(toEnQueue[i]);
                    } else {
                        inDegree.set(toEnQueue[i], inDegreeVal - 1);
                    }
                }
            }
        }
        return result;
    }

    /**
     * 销毁容器，以及容器里的所有 service，并调用所有 service 的 `destroy()` 方法（如果存在定义的话）。inject-js 会去分析已创建的所有 Service 实例，按照依赖的拓扑顺序，逆序小伙。如：A 依赖 B，B 依赖 C，则按照 A => B => C 的顺序依次调用它们的 destroy 方法。
     */
    public destroy () {
        for (const child of this.childContainers) {
            child.destroy();
        }
        const providers = this.getSortedList();
        for (let index = providers.length - 1; index >= 0; index--) {
            const element = providers[index];
            const thisProvider = this.providers.get(element);
            if (typeof thisProvider.destroy === 'function') {
                thisProvider.destroy();
            }
        }
        this.providers.clear();
        this.services = [];
    }
}
