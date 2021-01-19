"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../src/index");
const a = { age: 5 };
const m = { age: 5, name: 'leon' };
function sideEffect() {
    // console.log(n);
}
/**
 * 這些測試必須在 strictNullChecks = false 的環境下測試
 * 主要是確保 functor map 函式的傳回值型別是正確的
 */
describe('functor type (optional)', () => {
    const o = index_1.Optional.of(a);
    it('map', () => {
        const o1 = o.map(_ => 1);
        const o2 = o.map(_ => null);
        const o3 = o.map(_ => undefined);
        const o4 = o.map(_ => sideEffect());
        const o5 = o.map(_ => ({ age: 6 }));
        assert.deepStrictEqual(o5.orNull(), { age: 6 });
        const o6 = o.map(_ => m);
        assert.deepStrictEqual(o6.orNull(), m);
    });
    it('ifPresent', () => {
        const o4 = o.ifPresent(_ => sideEffect());
        const o5 = o.ifPresent(_ => ({ age: 6 }));
        assert.deepStrictEqual(o5.orNull(), { age: 6 });
        const o6 = o.ifPresent(_ => m);
        assert.deepStrictEqual(o6.orNull(), m);
    });
});
describe('functor type (result)', () => {
    const o = index_1.Result.ok(a);
    it('map', () => {
        const o1 = o.map(_ => 1);
        const o2 = o.map(_ => null);
        const o3 = o.map(_ => undefined);
        const o4 = o.map(_ => sideEffect());
        const o5 = o.map(_ => ({ age: 6 }));
        assert.deepStrictEqual(o5.orError(), { age: 6 });
        const o6 = o.map(_ => m);
        assert.deepStrictEqual(o6.orError(), m);
    });
    it('ifOk', () => {
        const o4 = o.ifOk(_ => sideEffect());
        const o5 = o.ifOk(_ => ({ age: 6 }));
        assert.deepStrictEqual(o5.orError(), { age: 6 });
        const o6 = o.ifOk(_ => m);
        assert.deepStrictEqual(o6.orError(), m);
    });
    it('ifFail', () => {
        const o = index_1.Result.fail(a);
        const o1 = o.ifFail(_ => 5);
        assert.deepStrictEqual(o1.error.orNull(), 5);
        const o2 = o.ifFail(_ => undefined);
        assert.deepStrictEqual(o2.error.orNull(), a);
        const o3 = o.ifFail(_ => sideEffect());
        assert.deepStrictEqual(o3.error.orNull(), a);
        const o4 = o.ifFail(_ => ({ age: 6 }));
        assert.deepStrictEqual(o4.error.orNull(), { age: 6 });
        const o5 = o.ifFail(_ => m);
        assert.deepStrictEqual(o5.error.orNull(), m);
    });
});
