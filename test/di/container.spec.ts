import 'reflect-metadata';
import { InjectToken } from '../../src/di/inject-token';
import { service } from '../../src/decorators/service';
import { inject } from '../../src/decorators/inject';
import { injectable } from '../../src/decorators/injectable';
import { Container } from '../../src/di/container';

describe('Container', () => {
    describe('#create', () => {
        it('支持创建无依赖的单个对象', () => {
            const di = new Container();
            class Foo {}
            di.addService(Foo);
            expect(di.create(Foo)).toBeInstanceOf(Foo);
        });
        it('支持解析依赖', () => {
            const di = new Container()
            class Bar {}
            di.addService(Bar);
            @injectable
            class Foo { constructor (public bar: Bar) {}}
            di.addService(Foo);
            const foo = di.create(Foo);
            expect(foo.bar).toBeInstanceOf(Bar);
        });
        it('支持解析递归依赖', () => {
            const di = new Container()
            @service(di)
            class Coo {}
            @service(di)
            class Bar { constructor (public coo: Coo) {} }
            @service(di)
            class Foo { constructor (public bar: Bar) {} }

            expect(di.create(Foo).bar.coo).toBeInstanceOf(Coo);
        });
        it('创建未注册的provider抛出异常', () => {
            const di = new Container()
            class Coo { }
            const t = () => { di.getOrCreateProvider(Coo); }
            expect(t).toThrow(Error);
        })
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
            di.addValue('air', 1);
            @injectable
            class Bar {
                public num: number;
                constructor(
                    @inject('air') num: number
                ) {
                    this.num = num;
                }
            }
            di.addService(Bar);
            const child = di.createChildContainer();
            child.addValue('air', 2);
            @service(child)
            class Dog { constructor(public bar: Bar) { }  }
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
                public destroy () {
                }
            }
            @service(child)
            class Dog {
                constructor(public bar: Bar) {}
                public destroy = mockDestroy
            }

            class Egg {
                public destroy() {}
            }
            child.addFactory("Egg", () => new Egg(), []);

            di.create(Bar);
            child.create(Dog);
            child.create("Egg");

            di.destroy();

            expect(mockDestroy.mock.instances[0]).toBeInstanceOf(Dog);
            expect(mockDestroy.mock.instances[1]).toBeInstanceOf(Bar);
        })
        
    });
    describe('#destroy', () => {
        it('分析依赖排序', () => {
            const di = new Container()
            @service(di)
            class Air { }
            @service(di)
            class Coo { }
            @service(di)
            class Bar { constructor(public coo: Coo, public air: Air) { } }
            @service(di)
            class Dog { }
            @service(di)
            class Foo { constructor(public air: Air, public bar: Bar, public dog: Dog) { } }
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
                constructor() { }
                public destroy = mockDestroy
            }
            di.addService(Foo);
            di.create(Foo);
            di.destroy();
            di.destroy();
            expect(mockDestroy.mock.instances.length).toEqual(1);
        });
    });
    describe('#getTokens', () => {
        it('支持获取provider token', () => {
            const di = new Container();
            class Foo { }
            di.addService(Foo);
            expect(di.getTokens()).toEqual([Foo]);
        })
    })
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
            const token = Symbol('foo');
            di.addValue(token, 'this is the value');
            expect(di.create(token)).toEqual('this is the value');
        });
    });
    describe('#addFactory', () => {
        it('支持 addFactory', () => {
            const di = new Container();
            const token = Symbol('foo');
            di.addFactory(token, () => 'FOO', []);
            const bar = di.create(token);
            expect(bar).toEqual('FOO');
        });
    });
    describe('#addProvider', () => {
        it('支持 addProvider', () => {
            const token = Symbol('foo');
            const di = new Container();
            class FooProvider { create () { return 'FOO'; } }
            di.addProvider(token, FooProvider);
            expect(di.create(token)).toEqual('FOO');
        });

        it('传入不符合规范的provider抛出异常', () => {
            const di = new Container();
            class FooProvider { }
            const t = () => {
                di.addProvider('foo', FooProvider);
            }
            expect(t).toThrowError();
        })

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
                    return { container, parent }
                }
            }
            di.addProvider(Foo, FooProvider);
            const { foo } = di.create(EntryService);
            expect(foo.container).toEqual(di);
            expect(foo.parent).toEqual(EntryService);
        });

        it('入口 Provider/Molecule parent 参数为 null', () => {
            const di = new Container()
            class Foo {}

            @injectable
            class FooProvider { // eslint-disable-line
                create (container, parent) {
                return { container, parent }
                }
            }
            di.addProvider(Foo, FooProvider)
            const foo = di.create(Foo)
            expect(foo.container).toEqual(di)
            expect(foo.parent).toEqual(null)
        });

        it('支持 @inject 装饰器', () => {
            const di = new Container();
            const token = Symbol('foo');

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
        })
  })
})
