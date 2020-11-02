import 'reflect-metadata';
import { inject } from '../../src/decorators/inject';

describe('.inject()', () => {
    it('should set `token` to dependency at `index`', () => {
        const obj = {};
        const propertyKeyForConstructor = undefined as any;
        const injector = inject('TOKEN');
        injector(obj, propertyKeyForConstructor, 0);
        expect(Reflect.getMetadata('design:paramtokens:0', obj)).toEqual('TOKEN');
    });
    it('should do nothing for other methods', () => {
        const obj = { foo: (arg) => arg };
        const propertyKeyForFoo = 'foo';
        const injector = inject('TOKEN');
        injector(obj, propertyKeyForFoo, 0);
        expect(Reflect.getMetadata('design:paramtokens:0', obj)).toEqual(undefined);
    });
});
