import { InjectToken, createInjectToken } from '../../src/di/inject-token';

describe('.createInjectToken()', () => {
    it('生成 Token 且唯一', () => {
        class Foo {};
        const FOO_TOKEN = createInjectToken<Foo>();
        const WILDCARD_TOKEN = createInjectToken();
        expect(FOO_TOKEN === WILDCARD_TOKEN).toBe(false);
    });
});
