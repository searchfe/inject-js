import { createFactoryProvider } from '../../src/di/factory-provider-impl';

describe('FactoryProviderImpl', () => {
    describe('#create', () => {
        it('调用工厂方法并返回其返回值', () => {
            const fn = jest.fn().mockImplementation(() => 'foo');
            const Provider = createFactoryProvider(fn);
            const p = new Provider();
            expect(p.create()).toEqual('foo');
            expect(fn).toBeCalled();
        });
        it('应该缓存工厂方法的返回值', () => {
            let i = 0;
            const fn = jest.fn().mockImplementation(() => ++i);
            const Provider = createFactoryProvider(fn);
            const p = new Provider();
            expect(p.create()).toEqual(1);
            expect(p.create()).toEqual(1);
        });
    });
    describe('#destroy', () => {
        it('应该调用实例的销毁', () => {
            const destroy = jest.fn();
            const Provider = createFactoryProvider(() => ({ destroy }));
            const p = new Provider();
            p.create();
            expect(destroy).not.toBeCalled();
            p.destroy();
            expect(destroy).toBeCalled();
        });
        it('实例未定义 destroy 时应该跳过', () => {
            const Provider = createFactoryProvider(() => ({}));
            const p = new Provider();
            p.create();
            expect(() => p.destroy()).not.toThrow();
        });
    });
});
