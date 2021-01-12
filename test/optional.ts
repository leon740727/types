import * as assert from 'assert';
import { Optional } from '../src/index';

declare const describe, it, before, after, afterEach;

describe('optional', () => {
    it('empty', () => {
        const o = Optional.of<number>(undefined);
        assert.ok(o.orElse(0) === 0);
        assert.ok(o.orNull() === null);
        assert.throws(() => o.orError(new Error('aaa')), {message: 'aaa'});
    });

    it('of', () => {
        const o = Optional.of(5);
        assert.ok(o.orElse(0) === 5);
        assert.ok(o.orNull() === 5);
        assert.ok(o.orError('') === 5);
    });

    it('map & chain', () => {
        const o = Optional.of(5);
        assert.ok(o.map(o => `five ${o}`).orNull() === 'five 5');
        assert.ok(o.chain(o => Optional.of(`five ${o}`)).orNull() === 'five 5');
    });
});
