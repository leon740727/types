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
    it('忽略轉換函式傳回的 undefined', () => {
        function sideEffect(n) {
            // console.log(n);
        }
        const o1 = index_1.Optional.of(5).map(_ => 6);
        assert.strictEqual(o1.orNull(), 6);
        const o2 = index_1.Optional.of(5).map(_ => 'five');
        assert.strictEqual(o2.orNull(), 'five');
        const o3 = index_1.Optional.of(5).map(_ => null);
        assert.strictEqual(o3.present, false);
        const o4 = index_1.Optional.of(5).map(_ => undefined);
        assert.strictEqual(o4.orNull(), 5);
        const o5 = index_1.Optional.of(5).map(sideEffect);
        assert.strictEqual(o5.orNull(), 5);
        const o6 = index_1.Optional.of(5).ifPresent(sideEffect);
        assert.strictEqual(o5.orNull(), 5);
    });
});
