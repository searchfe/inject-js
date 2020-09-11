# inject-js
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

### Container

根据控制反转的概念： [Inversion of Control](https://en.wikipedia.org/wiki/Inversion_of_control) (IoC)，Container作为控制反转的容器，当你给容器提供一个toke时，容器会自动的根据这个token值去注入对应的依赖，而这个功能的实现是依赖上述的 `inject` 以及 `injectable` 去实现的。

### inject-token

一个注入的token可以是 class construct, Symbol, 或者 string

```typescript
type InjectToken = Service | Symbol | string
```
