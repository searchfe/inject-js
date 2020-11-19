import { Map, decrease } from '../../src/utils/map';

describe('Map', () => {
    it('支持存取', () => {
        const map = new Map();
        map.set('foo', 'bar');
        expect(map.get('foo')).toEqual('bar');
    });
    it('支持清空', () => {
        const map = new Map();
        map.set('foo', 'bar');
        map.clear();
        expect(map.get('foo')).toEqual(undefined);
    });
    describe('#values()', () => {
        it('获取所有值', () => {
            const map = new Map();
            map.set('foo', 'bar');
            expect([...map.values()]).toEqual(['bar']);
        });
    });
});
describe('.decrease()', () => {
    it('支持 key 不存在的情况', () => {
        const map = new Map();
        decrease(map, 'foo');
        expect(map.get('foo')).toEqual(-1);
    });
});
