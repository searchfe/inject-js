# inject-js
[![Build Status](https://travis-ci.com/searchfe/inject-js.svg?branch=master)](https://travis-ci.com/github/searchfe/inject-js)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/searchfe/inject-js)
[![Coveralls](https://img.shields.io/coveralls/searchfe/inject-js.svg)](https://coveralls.io/github/searchfe/inject-js?branch=master)

A tiny dependency Injection library for TypeScript. <https://searchfe.github.io/inject-js/>

- [简体中文](https://github.com/searchfe/inject-js/blob/master/README.md)

## Install

Can be installed via `npm`

```sh
npm install --save @searchfe/inject-js
```

inject-js uses [Reflect Metadata][reflect-metadata] to determine dependencies, so you need make sure your  `tsconfig.json` contains:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

And, you'll need a polyfill for the Reflect API, such as:

- [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
- [core-js (core-js/es7/reflect)](https://www.npmjs.com/package/core-js)
- [reflection](https://www.npmjs.com/package/@abraham/reflection)

## Usage

Following are some use cases, more details please refer to [the API Reference][API].

### @injectable

@injectable is used to decorate the Service class, so that its dependencies can be resolved by inject-js and it can be injected to other services.

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

// index.ts application entry
import { Container } from 'inject-js';
import { Car } from './car';
import { Wheel } from './wheel;

const di = new Container();
di.addService(Car);
di.addService(Wheel);
const car = di.create(Car);
```

### @inject

@inject(token) is used to decorate a dependency (constructor argument) to specify which provider should be used. The `token` argument is the unique identifier of a Provider within the container. `token` is typically used for cases where there's no Service class actually defined, or Metadata API is not available.

```typescript
import { inject } from 'inject-js';
import { Wheel } from './wheel';

@injectable
export class Car {
    constructor(@inject('Wheel') private wheel: Wheel) {}
}

// index.ts application entry
import { Container } from 'inject-js';
import { Car } from './car';
import { Wheel } from './wheel';

const di = new Container();
di.addService('Wheel', Wheel);
di.addService(Car);
const car = di.create(Car);
```

### @service

If the container instance is available in the context where Services are defined, @service can be used as a shorthand of `.addService()`:

```typescript
const container = new Container();

@service(container)
class FooService {}

// Equivalent to:

const container = new Container();

@injectable
class FooService {}

container.addService(FooService)
```

### Container

The [Container][container] class maintains a set of Providers and the corresponding Tokens. There're several ways to register Providers:

* [.addProvider()][addProvider]: register a factory class with a `.create(): Service` method. All other ways are implemented using `.addProvider()` internally.
* [.addFactory()][addFactory]: register a factory function which returns a Service instance.
* [.addService()][addService]: register a concrete Service class.
* [.addValue()][addValue]: register a value.

[API]: https://searchfe.github.io/inject-js/
[container]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html
[addProvider]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html#addprovider
[addService]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html#addService
[addValue]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html#addValue
[addFactory]: https://searchfe.github.io/inject-js/classes/_di_container_.container.html#addFactory
[reflect-metadata]: https://rbuckton.github.io/reflect-metadata/
