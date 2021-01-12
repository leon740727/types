"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../src/index");
describe('optional', () => {
    it('empty', () => {
        const o = index_1.Optional.of(undefined);
        assert.ok(o.orElse(0) === 0);
        assert.ok(o.orNull() === null);
        assert.throws(() => o.orError(new Error('aaa')), { message: 'aaa' });
    });
    it('of', () => {
        const o = index_1.Optional.of(5);
        assert.ok(o.orElse(0) === 5);
        assert.ok(o.orNull() === 5);
        assert.ok(o.orError('') === 5);
    });
    it('map & chain', () => {
        const o = index_1.Optional.of(5);
        assert.ok(o.map(o => `five ${o}`).orNull() === 'five 5');
        assert.ok(o.chain(o => index_1.Optional.of(`five ${o}`)).orNull() === 'five 5');
    });
});
