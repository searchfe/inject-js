import { createServiceProvider } from '../../src/di/service-provider-impl';

describe('ServiceProviderImpl', () => {
    describe('#create', () => {
        it('创建新实例', () => {
            class Foo {}
            const Provider = createServiceProvider(Foo);
            const p = new Provider();
            expect(p.create()).toBeInstanceOf(Foo);
        });
        it('多次创建应该返回同一个实例', () => {
            class Foo {}
            const Provider = createServiceProvider(Foo);
            const p = new Provider();
            const [a, b] = p.create();
            expect(a).toEqual(b);
        });
    });
    describe('#destroy', () => {
        it('应该调用实例的销毁', () => {
            const destroy = jest.fn();
            class Foo { destroy = destroy }
            const Provider = createServiceProvider(Foo);
            const p = new Provider();
            expect(p.create()).toBeInstanceOf(Foo);

            expect(destroy).not.toBeCalled();
            p.destroy();
            expect(destroy).toBeCalled();
        });
        it('实例未定义 destroy 时应该跳过', () => {
            class Foo { }
            const Provider = createServiceProvider(Foo);
            const p = new Provider();
            expect(p.create()).toBeInstanceOf(Foo);
            expect(() => p.destroy()).not.toThrow();
        });
    });
});
