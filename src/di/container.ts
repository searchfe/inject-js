import { isProvider } from './provider';
import { createValueProvider } from './value-provider-impl';
import { createServiceProvider } from './service-provider-impl';
import { createFactoryProvider } from './factory-provider-impl';
import { Map } from '../utils/map';
import { InjectToken } from './inject-token';
import { getDependencies, setDependencies } from './dependency';

export class Container {
    private providers: Map
    private providerClasses: Map
    private services: any[] = [];
    private prerequisites: any[][] = [];

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
        const deps = ProviderClass.dependencies().map(dep => {
            this.prerequisites.push([fn, dep]);
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

    public destroy () {
        const providers = this.getSortedList();
        for (let index = providers.length - 1; index >= 0; index--) {
            const element = providers[index];
            const thisProvider = this.providers.get(element);
            if (thisProvider.destroy && typeof thisProvider.destroy === 'function') {
                thisProvider.destroy();
            }
        }
        this.providers.clear();
        this.services = [];
    }
}
