import { Map } from '../../src/utils/map'

describe('Map', () => {
  it('支持存取', () => {
    const map = new Map();
    map.set('foo', 'bar');
    expect(map.get('foo')).toEqual('bar');
    expect(map.size === 1);
  })
  it('支持清空', () => {
    const map = new Map();
    map.set('foo', 'bar');
    map.clear();
    expect(map.get('foo')).toEqual(null);
    expect(map.size === 0);
  })
})
