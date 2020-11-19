import { Map, decrease, increase } from './map';

export class Graph<T> {
    private inDegrees = new Map<T, number>()
    private adj = new Map<T, T[]>()
    // 添加边
    addEdge (fr: T, to: T) {
        const edges = this.adj.get(fr) || [];
        edges.push(to);
        this.adj.set(fr, edges);
        increase(this.inDegrees, to);
    }
    addVertex (v: T) {
        if (!this.adj.has(v)) {
            this.adj.set(v, []);
        }
    }
    // 按照拓扑序移除所有节点
    popAll () {
        const free = [];
        const ordered = [];
        for (const key of this.adj.keys()) {
            if (!this.inDegrees.get(key)) free.push(key);
        }
        while (free.length) {
            const fr = free.shift();
            ordered.push(fr);
            for (const to of this.adj.get(fr) || []) {
                const degree = decrease(this.inDegrees, to);
                if (!degree) free.push(to);
            }
        }
        this.inDegrees.clear();
        this.adj.clear();
        return ordered;
    }
}
