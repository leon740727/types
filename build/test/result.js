"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../src/index");
describe('result', () => {
    it('result 的狀態 (ok | fail) 取決於 error 是否為空 (null)', () => {
        assert.ok(index_1.Result.fail('').error.present);
        assert.ok(index_1.Result.fail('').fail);
        assert.ok(index_1.Result.ok(null).ok); // value 與 error 都可以是空的
    });
    it('Result<e, number>.ok', () => {
        const r = index_1.Result.ok(5);
        assert.ok(r.ok === true);
        assert.ok(r.value.orNull() === 5);
    });
    it('Result<e, Optional<number>>.ok', () => {
        const r = index_1.Result.ok(index_1.Optional.of(5));
        assert.ok(r.ok === true);
        assert.ok(r.value.chain(v => v).orNull() === 5);
    });
    it('Result<e, null>', () => {
        const r = index_1.Result.ok(null);
        assert.ok(r.ok === true);
        assert.ok(r.value.present === false);
    });
    it('operation on null result value', () => {
        const r = index_1.Result.ok(null);
        assert.strictEqual(r.map(_ => true).orError(), true);
        assert.strictEqual(r.either(error => null, value => true), true);
    });
    it('fail', () => {
        const r = index_1.Result.fail('fail');
        assert.ok(r.ok === false);
        assert.ok(r.value.present === false);
        assert.ok(r.error.orNull() === 'fail');
        let error = null;
        try {
            r.orError();
        }
        catch (e) {
            error = e;
        }
        finally {
            assert.ok(error === 'fail');
        }
    });
    it('Result.fail(null)', () => {
        assert.throws(() => index_1.Result.fail(null), { message: 'error value in Result.fail(error) could not be null' });
    });
    it('不允許 ifFail() 把 error 變成 null', () => {
        assert.throws(() => index_1.Result.fail('').ifFail(_ => null), { message: 'function argument in Result.ifFail() could not return null' });
    });
    it('忽略 map 轉換函式傳回的 undefined', () => {
        function sideEffect(n) {
            // console.log(n);
        }
        const o = index_1.Result.ok(5);
        const o1 = o.map(_ => true);
        assert.strictEqual(o1.orError(), true);
        const o2 = o.map(_ => null);
        assert.strictEqual(o2.orError(), null);
        const o3 = o.map(_ => undefined);
        assert.strictEqual(o3.orError(), 5);
        const o4 = o.map(sideEffect);
        assert.strictEqual(o4.orError(), 5);
        const e = index_1.Result.fail('xx');
        const e1 = e.map(i => null);
        assert.strictEqual(e1.error.orNull(), 'xx');
        const e2 = e.map(sideEffect);
        assert.strictEqual(e2.error.orNull(), 'xx');
    });
    it('忽略 ifFail 轉換函式傳回的 undefined', () => {
        function sideEffect(n) {
            // console.log(n);
        }
        const o = index_1.Result.fail('xx');
        const o1 = o.ifFail(_ => false);
        assert.strictEqual(o1.error.orNull(), false);
        const o2 = o.ifFail(_ => undefined);
        assert.strictEqual(o2.error.orNull(), 'xx');
        const o3 = o.ifFail(sideEffect);
        assert.strictEqual(o3.error.orNull(), 'xx');
    });
    it('map & chain', () => {
        const r = index_1.Result.ok(5);
        assert.ok(r.map(n => `five ${n}`).value.orNull() === 'five 5');
        assert.ok(r.chain(n => index_1.Result.ok(`five ${n}`)).value.orNull() === 'five 5');
    });
    it('orElse helper', () => {
        assert.ok(index_1.Result.ok(5).orElse(0) === 5);
        assert.ok(index_1.Result.fail('').orElse(0) === 0);
    });
    it('orError helper', () => {
        assert.ok(index_1.Result.ok(5).orError() === 5);
        assert.throws(() => index_1.Result.fail(new Error('xx')).orError(), { message: 'xx' });
    });
    it('all', () => {
        const allOks = [index_1.Result.ok(1), index_1.Result.ok(2), index_1.Result.ok(3)];
        const someOks = [index_1.Result.ok(1), index_1.Result.fail('e1'), index_1.Result.ok(2)];
        const allFails = [index_1.Result.fail('e1'), index_1.Result.fail('e2')];
        assert.deepStrictEqual(index_1.Result.all(allOks).orError(), [1, 2, 3]);
        assert.deepStrictEqual(index_1.Result.all(someOks).error.orElse([]).map(error => error.orNull()), [null, 'e1', null]);
        assert.deepStrictEqual(index_1.Result.all(allFails).error.orElse([]).map(error => error.orNull()), ['e1', 'e2']);
    });
});
