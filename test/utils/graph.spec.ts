import { Graph } from '../../src/utils/graph';

describe('graph', () => {
    it('递归依赖', () => {
        const g = new Graph<string>();
        g.addEdge('air', 'foo');
        g.addEdge('bar', 'foo');
        g.addEdge('dog', 'foo');
        g.addEdge('coo', 'bar');
        g.addEdge('air', 'bar');
        expect([...g.popAll()]).toEqual(['air', 'dog', 'coo', 'bar', 'foo']);
    });

    describe('.addVertex()', () => {
        it('重复添加的情况', () => {
            const g = new Graph<string>();
            g.addEdge('bar', 'foo');
            g.addVertex('foo');
            g.addVertex('foo');
            g.addVertex('bar');
            expect([...g.popAll()]).toEqual(['bar', 'foo']);
        });
    });
});
