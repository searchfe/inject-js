import 'reflect-metadata';
import { InjectToken, createInjectToken } from '../../src/di/inject-token';
import { service } from '../../src/decorators/service';
import { inject } from '../../src/decorators/inject';
import { injectable } from '../../src/decorators/injectable';
import { Container } from '../../src/di/container';
import { Provider, ProviderClass } from '../../src/di/provider';

describe('Container', () => {
    describe('#create', () => {
        it('支持创建无依赖的单个对象', () => {
            const di = new Container();
            class Foo {}
            di.addService(Foo);
            expect(di.create(Foo)).toBeInstanceOf(Foo);
        });
        it('支持解析依赖', () => {
            const di = new Container();
            class Bar {}
            di.addService(Bar);
            @injectable
            class Foo { constructor (public bar: Bar) {}}
            di.addService(Foo);
            const foo = di.create(Foo);
            expect(foo.bar).toBeInstanceOf(Bar);
        });
        it('支持解析递归依赖', () => {
            const di = new Container();
            @service(di)
            class Coo {}
            @service(di)
            class Bar { constructor (public coo: Coo) {} }
            @service(di)
            class Foo { constructor (public bar: Bar) {} }

            expect(di.create(Foo).bar.coo).toBeInstanceOf(Coo);
        });
        it('创建未注册的provider抛出异常', () => {
            const di = new Container();
            class Coo { }
            const t = () => { di.getOrCreateProvider(Coo); };
            expect(t).toThrow(Error);
        });
    });
    describe('#createChildContainer', () => {
        it('支持创建子容器', () => {
            const di = new Container();
            const child = di.createChildContainer();

            expect(child.parent).toEqual(di);
        });
        it('子容器可创建父容器的service', () => {
            const di = new Container();
            @service(di)
            class Bar { }
            const child = di.createChildContainer();

            expect(child.create(Bar)).toBeInstanceOf(Bar);
        });
        it('子容器可依赖父容器的service', () => {
            const di = new Container();
            const token = createInjectToken();
            di.addValue(token, 1);
            @injectable
            class Bar {
                public num: number;
                constructor (
                    @inject(token) num: number
                ) {
                    this.num = num;
                }
            }
            di.addService(Bar);
            const child = di.createChildContainer();
            child.addValue(token, 2);
            @service(child)
            class Dog { constructor (public bar: Bar) { } }
            expect(child.create(Dog).bar.num).toEqual(1);
        });
        it('父容器销毁', () => {
            const mockDestroy = jest.fn();
            const di = new Container();
            @service(di)
            class Bar {
                public destroy = mockDestroy
            }
            const child = di.createChildContainer();
            @service(child)
            class Coo {
                public destroy () {}
            }
            @service(child)
            class Dog {
                constructor (public bar: Bar) {}
                public destroy = mockDestroy
            }

            class Egg {
                public destroy () {}
            }
            const EGG_TOKEN = createInjectToken<Egg>();
            child.addFactory(EGG_TOKEN, () => new Egg(), []);

            di.create(Bar);
            child.create(Dog);
            child.create(EGG_TOKEN);

            di.destroy();

            expect(mockDestroy.mock.instances[0]).toBeInstanceOf(Dog);
            expect(mockDestroy.mock.instances[1]).toBeInstanceOf(Bar);
        });
    });
    describe('#destroy', () => {
        it('分析依赖排序', () => {
            const di = new Container();
            @service(di)
            class Air { }
            @service(di)
            class Coo { }
            @service(di)
            class Bar { constructor (public coo: Coo, public air: Air) { } }
            @service(di)
            class Dog { }
            @service(di)
            class Foo { constructor (public air: Air, public bar: Bar, public dog: Dog) { } }
            di.create(Foo);
            expect(di.getSortedList()).toEqual([Air, Coo, Dog, Bar, Foo]);
        });

        it('可调用destroy方法', () => {
            const di = new Container();
            class Foo {
                constructor () {}
                public destroy () {
                    return 'destroy';
                }
            }
            di.addService(Foo);
            di.create(Foo);
            di.destroy();
            expect(di.getServices()).toEqual([]);
        });

        it('destroy方法不被重复调用', () => {
            const di = new Container();
            const mockDestroy = jest.fn();
            class Foo {
                constructor () { }
                public destroy = mockDestroy
            }
            di.addService(Foo);
            di.create(Foo);
            di.destroy();
            di.destroy();
            expect(mockDestroy.mock.instances.length).toEqual(1);
        });

        it('没有 destroy 方法的 Service 直接跳过，不抛出异常', () => {
            const di = new Container();
            class FooProvider {
                constructor () {}
                create () { return {}; }
            }
            const token = createInjectToken();
            di.addProvider(token, FooProvider);
            di.create(token);
            expect(() => di.destroy()).not.toThrow();
        });
    });
    describe('#getTokens', () => {
        it('支持获取provider token', () => {
            const di = new Container();
            class Foo { }
            di.addService(Foo);
            expect(di.getTokens()).toEqual([Foo]);
        });

        it('生成 Token 且唯一', () => {
            class Foo {};
            const FOO_TOKEN = createInjectToken<Foo>();
            const WILDCARD_TOKEN = createInjectToken();
            expect(FOO_TOKEN === WILDCARD_TOKEN).toBe(false);
        });
    });
    describe('#addService', () => {
        it('支持 addService', () => {
            const di = new Container();
            class Foo {}
            di.addService(Foo);
            expect(di.create(Foo)).toBeInstanceOf(Foo);
        });
    });
    describe('#addValue', () => {
        it('支持 addValue', () => {
            const di = new Container();
            const token = createInjectToken();
            di.addValue(token, 'this is the value');
            expect(di.create(token)).toEqual('this is the value');
        });
    });
    describe('#addFactory', () => {
        it('支持 addFactory', () => {
            const di = new Container();
            const token = createInjectToken();
            di.addFactory(token, () => 'FOO', []);
            const bar = di.create(token);
            expect(bar).toEqual('FOO');
        });
    });
    describe('#addProvider', () => {
        it('支持 addProvider', () => {
            const token = createInjectToken();
            const di = new Container();
            class FooProvider { create () { return 'FOO'; } }
            di.addProvider(token, FooProvider);
            expect(di.create(token)).toEqual('FOO');
        });

        it('传入不符合规范的provider抛出异常', () => {
            const token = createInjectToken();
            const di = new Container();
            class FooProvider { }
            const t = () => {
                di.addProvider(token, FooProvider as unknown as ProviderClass<any>);
            };
            expect(t).toThrowError();
        });

        it('传入的 Token 和 Provider 类型不一致时应该报类型错误', () => {
            class Foo { private name = 'foo'; }
            class FooProvider { create () { return new Foo(); } }
            class Bar { private name = 'bar'; }
            class BarProvider { create () { return new Bar(); } }
            const FOO_TOKEN = createInjectToken<Foo>();
            const WILDCARD_TOKEN = createInjectToken();
            const di = new Container();
            // 下面被注释掉的行都是会报类型错误的
            // 测试 addProvider
            // di.addProvider('123', BarProvider);
            di.addProvider(WILDCARD_TOKEN, BarProvider);
            // di.addProvider(Foo, BarProvider);
            di.addProvider(Bar, BarProvider);
            // di.addProvider(FOO_TOKEN, BarProvider);
            di.addProvider(FOO_TOKEN, FooProvider);
            // 测试 addFactory
            di.addFactory(FOO_TOKEN, () => new Foo(), []);
            // di.addFactory(FOO_TOKEN, () => new Bar(), []);
            di.addFactory(Foo, () => new Foo(), []);
            // di.addFactory(Foo, () => new Bar(), []);
            // 测试 addValue
            di.addValue(WILDCARD_TOKEN, 1);
            // di.addValue(FOO_TOKEN, 1);
            // di.addValue(Foo, 1);
        });

        it('调用 addProvider 时传递 container 和 parent', () => {
            const di = new Container();

            class Foo {}

            @service(di)
            class EntryService {
                constructor (public foo: Foo) {}
            }

            @injectable
            class FooProvider { // eslint-disable-line
                create (container, parent) {
                    return { container, parent };
                }
            }
            di.addProvider(Foo, FooProvider);
            const { foo } = di.create(EntryService);
            expect(foo.container).toEqual(di);
            expect(foo.parent).toEqual(EntryService);
        });

        it('入口 Provider/Molecule parent 参数为 null', () => {
            const di = new Container();
            class Foo {}

            @injectable
            class FooProvider { // eslint-disable-line
                create (container, parent) {
                    return { container, parent };
                }
            }
            di.addProvider(Foo, FooProvider);
            const foo = di.create(Foo);
            expect(foo.container).toEqual(di);
            expect(foo.parent).toEqual(null);
        });

        it('支持 @inject 装饰器', () => {
            const di = new Container();
            const token = createInjectToken<Foo>();

            interface Foo {
                container: Container, parent: InjectToken
            }

            @service(di)
            class EntryService {
                constructor (@inject(token) public foo: Foo) {}
            }

            @injectable
            class FooProvider { // eslint-disable-line
                create (container, parent) {
                    return { container, parent };
                }
            }
            di.addProvider(token, FooProvider);
            const { foo } = di.create(EntryService);
            expect(foo.container).toEqual(di);
            expect(foo.parent).toEqual(EntryService);
        });
    });
});
