import 'reflect-metadata';
import { inject } from '../../src/decorators/inject';
import { createInjectToken } from '../../src/di/inject-token';

describe('.inject()', () => {
    it('should set `token` to dependency at `index`', () => {
        const obj = {};
        const propertyKeyForConstructor = undefined as any;
        const token = createInjectToken();
        const injector = inject(token);
        injector(obj, propertyKeyForConstructor, 0);
        expect(Reflect.getMetadata('design:paramtokens:0', obj)).toEqual(token);
    });
    it('should do nothing for other methods', () => {
        const obj = { foo: (arg) => arg };
        const propertyKeyForFoo = 'foo';
        const token = createInjectToken();
        const injector = inject(token);
        injector(obj, propertyKeyForFoo, 0);
        expect(Reflect.getMetadata('design:paramtokens:0', obj)).toEqual(undefined);
    });
});
