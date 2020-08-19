import { createValueProvider } from '../../src/di/value-provider-impl'

describe('ValueProviderImpl', () => {
  describe('#create', () => {
    it('直接返回固定对象', () => {
      const P = createValueProvider('foo')
      expect(new P().create()).toEqual('foo')
    })
  })
})
