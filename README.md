# inject-js
[![Build Status](https://travis-ci.com/searchfe/inject-js.svg?branch=master)](https://travis-ci.com/github/searchfe/inject-js)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/searchfe/inject-js)
[![Coveralls](https://img.shields.io/coveralls/searchfe/inject-js.svg)](https://coveralls.io/github/searchfe/inject-js?branch=master)

一个极简的 TypeScript 依赖注入框架。<https://searchfe.github.io/inject-js/>

- [English](https://github.com/searchfe/inject-js/blob/master/README.en.md)

## 安装

使用 npm 来安装：

```sh
npm install --save @searchfe/inject-js
```

inject-js 需要 [Reflect Metadata][reflect-metadata] 来在运行时决定依赖类型，你的 `tsconfig.json` 需要包含以下的设置：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

另外因为该库依赖 Reflect 的使用，确保运行时存在 Reflect API 的 Polyfill，比如以下之一：

- [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
- [core-js (core-js/es7/reflect)](https://www.npmjs.com/package/core-js)
- [reflection](https://www.npmjs.com/package/@abraham/reflection)

## 使用

以下是一些使用案例，更多细节请参考 [API 文档][API]。

### @injectable

用 `@injectable` 来装饰一个 Service，这样 inject-js 就可以（借由 metadata）得知它的依赖并在运行时注入。

```typescript
// car.ts
import { injectable } from 'inject-js';
import { Wheel } from './wheel';

@injectable
export class Car {
    constructor(private wheel: Wheel) {}
}

// wheel.ts
import { injectable } from 'inject-js';

@injectable
export class Wheel {
    constructor() {}
}

// index.ts 应用入口
import { Container } from 'inject-js';
import { Car } from './car';
import { Wheel } from './wheel;

const di = new Container();
di.addService(Car);
di.addService(Wheel);
const car = di.create(Car);
```

### @inject

用 `@inject(token)` 来装饰一个依赖（构造参数），来指定被注入的类。`token` 即为当前容器内 Provider 的唯一标识。
用于没有 Service 声明的场景（只有 Provider），或者没有 Metadata API 支持的场景。
也就是说借此可以在 JavaScript 代码中使用 inject-js。

```typescript
import { inject } from 'inject-js';
import { Wheel } from './wheel';

@injectable
export class Car {
    constructor(@inject('Wheel') private wheel: Wheel) {}
}

// index.ts 应用入口
import { Container } from 'inject-js';
import { Car } from './car';
import { Wheel } from './wheel';

const di = new Container();
di.addService('Wheel', Wheel);
di.addService(Car);
const car = di.create(Car);
```

### @service

如果 Container 实例就在定义 Service 的上下文中，可以用 @service 装饰器来直接注册：

```typescript
const container = new Container();

@service(container)
class FooService {}

// 相当于：

const container = new Container();

@injectable
class FooService {}

container.addService(FooService)
```

### Container

[Container][container] 会维护一个 Providers 集合，以及每个 Provider 对应的 Token。需要创建实例时，会根据 Token 查找对应的 Provider 并进行创建。
我们提供了如下几种注册 Provider 的方式：

* [.addProvider()][addProvider]：注册一个具有 `.create(): Service` 方法的 Provider 类（工厂类），其余注册方式都是用 addProvider 实现的。
* [.addFactory()][addFactory]：注册一个会返回 Service 实例的方法（工厂方法）。
* [.addService()][addService]：注册一个具体的 Service 类。
* [.addValue()][addValue]：注册一个具体的值。

## 示例

在 demo 下包含了一个使用 inject-js 的示例。可以按以下步骤执行该示例：

1. 进入 inject-js 项目根目录。
1. 构建 inject-js：`npm install && npm run build`。
2. 执行 demo：`npm run demo`。

[API]: https://searchfe.github.io/inject-js/
[container]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html
[addProvider]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html#addprovider
[addService]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html#addService
[addValue]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html#addValue
[addFactory]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html#addFactory
[reflect-metadata]: https://rbuckton.github.io/reflect-metadata/
