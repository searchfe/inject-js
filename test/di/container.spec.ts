import 'reflect-metadata';
import { InjectToken } from '../../src/di/inject-token';
import { service } from '../../src/decorators/service';
import { provider } from '../../src/decorators/provider';
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

        it('调用 addProvider 时传递 container 和 parent', () => {
            const di = new Container();

            class Foo {}

            @service(di)
            class EntryService {
                constructor (public foo: Foo) {}
            }

            @provider
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

            @provider
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

            @provider
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
