# inject-js
[![Build Status](https://travis-ci.org/searchfe/inject-js.svg?branch=master)](https://travis-ci.org/github/searchfe/inject-js)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/searchfe/inject-js)

a dependency Injection library.

依赖注入lib库

## 安装

使用 `npm` 来安装依赖

```sh
npm install --save @searchfe/inject-js
```

修改你的 `tsconfig.json` 包含以下的设置

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

另外因为该库依赖Reflect的使用，需要安装Reflect API的polyfill，包括但不限于：


- [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
- [core-js (core-js/es7/reflect)](https://www.npmjs.com/package/core-js)
- [reflection](https://www.npmjs.com/package/@abraham/reflection)

# API

## 装饰器

### injectable

类装饰injectable会在运行时将该class的依赖自动注入，内部通过获取该class的metadata来实现。

### 用法

```typescript
// LogService.ts

import { injectable } from 'inject-js';
import { QueryInfo } from './queryInfo.service';

@injectable
class LogService {
    constructor(queryInfo: QueryInfo) {}
}

// index.ts 调用入口文件
import { Container } from 'inject-js';
import { QueryInfo } from './queryInfo.service';
import { LogService } from './LogService.ts;

const di = new Container();
di.addService(QueryInfo);
di.addService(LogService);
di.create(LogService);

```

### inject

参数装饰器inject会在运行时找到inject的token值进行注入。

### 用法

```typescript
import { inject } from 'inject-js';
import { QueryInfo } from './queryInfo.service';

@injectable
class LogService {
    constructor(
        @inject('QueryInfo') private queryinfo: QueryInfo
    ) {}
}

// index.ts 调用入口文件
import { Container } from 'inject-js';
import { QueryInfo } from './queryInfo.service';
import { LogService } from './LogService.ts;

const di = new Container();
di.LogService('QueryInfo', QueryInfo);
di.addService(LogService);
di.create(LogService);

```

### service

也可以直接使用service去声明一个容器的service

```typescript
@service(container)
class FooService {}

// 相当于：

class FooService {}
container.addService(FooService)
```

# Container

依赖注入容器

根据控制反转的概念： [Inversion of Control](https://en.wikipedia.org/wiki/Inversion_of_control) (IoC)，Container作为控制反转的容器，当你给容器提供一个toke时，容器会自动的根据这个token值去注入对应的依赖，而这个功能的实现是依赖上述的 `inject` 以及 `injectable` 去实现的。

### inject-token

一个注入的token可以是 class construct, Symbol, 或者 string

```typescript
type InjectToken = Service | Symbol | string
```

### Providers

在container中，有一个私有变量providers，用于提供给容器去根据其token加载对应的实例。在我们的lib库里面，提供了以下3中类型的provider：Service Provider/Value Provider/Factory provider，并且可以通过对应的方法注册不同的provider。

### addProvider

container的addProvider方法可以为该容器注册一个provider，每个provider需要提供create初始化方法，返回该provider注入的依赖。

#### addService

service类型的provider可以调用addService来进行注册，inject-js内部的service-provider-impl会将传入的class注册到容器上，初始化时会生成一个实例注入到容器中。

#### addValue

value类型的provider可以调用addValue来进行注册，inject-js内部的value-provider-impl会将传入的value值注册到容器上，初始化时会自动注入到容器中。

#### addFactory

factory类型的provider可以调用addFactory来进行注册，inject-js内部的factory-provider-impl会将传入的工厂方法注册到容器上，初始化时传入工厂的参数完成初始化注入到容器中。

## destroy

容器提供了destroy方法，当调用容器的destroy方法时，inject-js会去分析已创建的所有provider进行拓扑排序，然后按照依赖倒序进行销毁，如：A依赖B，B依赖C，则按照A=>B=>C的顺序依次查找provider上面的destroy方法进行销毁
