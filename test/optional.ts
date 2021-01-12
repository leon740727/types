import * as assert from 'assert';
import { Optional } from '../src/index';

declare const describe, it, before, after, afterEach;

describe('optional', () => {
    it('empty', () => {
        const o = Optional.of<number>(undefined);
        assert.ok(o.or_else(0) === 0);
        assert.ok(o.or_null() === null);
        assert.throws(() => o.or_error(new Error('aaa')), {message: 'aaa'});
    });

    it('of', () => {
        const o = Optional.of(5);
        assert.ok(o.or_else(0) === 5);
        assert.ok(o.or_null() === 5);
        assert.ok(o.or_error('') === 5);
    });

    it('map & chain', () => {
        const o = Optional.of(5);
        assert.ok(o.map(o => `five ${o}`).or_null() === 'five 5');
        assert.ok(o.chain(o => Optional.of(`five ${o}`)).or_null() === 'five 5');
    });
});
