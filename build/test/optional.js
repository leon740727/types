"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../src/index");
describe('optional', () => {
    it('empty', () => {
        const o = index_1.Optional.of(undefined);
        assert.ok(o.or_else(0) === 0);
        assert.ok(o.or_null() === null);
        assert.throws(() => o.or_error(new Error('aaa')), { message: 'aaa' });
    });
    it('of', () => {
        const o = index_1.Optional.of(5);
        assert.ok(o.or_else(0) === 5);
        assert.ok(o.or_null() === 5);
        assert.ok(o.or_error('') === 5);
    });
    it('map & chain', () => {
        const o = index_1.Optional.of(5);
        assert.ok(o.map(o => `five ${o}`).or_null() === 'five 5');
        assert.ok(o.chain(o => index_1.Optional.of(`five ${o}`)).or_null() === 'five 5');
    });
});
