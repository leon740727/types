import * as assert from 'assert';
import { Result } from '../src/index';

declare const describe, it, before, after, afterEach;

describe('result', () => {
    it('fail', () => {
        const r = Result.fail('fail');
        assert.ok(r.ok === false);
        assert.ok(r.value.or_null() === null);
        assert.ok(r.error.or_null() === 'fail');
    });

    it('ok', () => {
        const r = Result.ok(5);
        assert.ok(r.ok === true);
        assert.ok(r.value.or_null() === 5);
        assert.ok(r.error.or_null() === null);
    });

    it('map & chain', () => {
        const r = Result.ok(5);
        assert.ok(r.map(n => `five ${n}`).value.or_null() === 'five 5');
        assert.ok(r.chain(n => Result.ok(`five ${n}`)).value.or_null() === 'five 5');
    });
});
