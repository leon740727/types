import * as assert from 'assert';
import { Result, Optional } from '../src/index';

declare const describe, it, before, after, afterEach;

describe('result', () => {
    it('result 的狀態 (ok | fail) 取決於 error 是否為空 (null)', () => {
        assert.ok(Result.fail('').error.present);
        assert.ok(Result.fail('').fail);
        assert.ok(Result.ok(null).ok);          // value 與 error 都可以是空的
    });

    it('Result<e, number>.ok', () => {
        const r = Result.ok(5);
        assert.ok(r.ok === true);
        assert.ok(r.value.orNull() === 5);
    });

    it('Result<e, Optional<number>>.ok', () => {
        const r = Result.ok(Optional.of(5));
        assert.ok(r.ok === true);
        assert.ok(r.value.chain(v => v).orNull() === 5);
    });

    it('Result<e, null>', () => {
        const r = Result.ok(null);
        assert.ok(r.ok === true);
        assert.ok(r.value.present === false);
    });

    it('operation on null result value', () => {
        const r = Result.ok(null);
        assert.strictEqual(r.map(_ => true).orError(), true);
        assert.strictEqual(r.either(error => null, value => true), true);
    });

    it('fail', () => {
        const r = Result.fail('fail');
        assert.ok(r.ok === false);
        assert.ok(r.value.present === false);
        assert.ok(r.error.orNull() === 'fail');
        
        let error = null;
        try {
            r.orError();
        } catch (e) {
            error = e;
        } finally {
            assert.ok(error === 'fail');
        }
    });

    it('Result.fail(null)', () => {
        assert.throws(
            () => Result.fail<string, number>(null as any),
            { message: 'error value in Result.fail(error) could not be null' });
    });

    it('不允許 ifError() 把 error 變成 null', () => {
        assert.throws(
            () => Result.fail<string, number>('').ifError(_ => null),
            { message: 'function argument in Result.ifError() could not return null' });
    });

    it('map & chain', () => {
        const r = Result.ok(5);
        assert.ok(r.map(n => `five ${n}`).value.orNull() === 'five 5');
        assert.ok(r.chain(n => Result.ok(`five ${n}`)).value.orNull() === 'five 5');
    });

    it('orElse helper', () => {
        assert.ok(Result.ok(5).orElse(0) === 5);
        assert.ok(Result.fail<string, number>('').orElse(0) === 0);
    });

    it('orError helper', () => {
        assert.ok(Result.ok(5).orError() === 5);
        assert.throws(() => Result.fail<Error, number>(new Error('xx')).orError(), {message: 'xx'});
    });

    it('all', () => {
        const allOks: Result<string, number>[] = [Result.ok(1), Result.ok(2), Result.ok(3)];
        const someOks: Result<string, number>[] = [Result.ok(1), Result.fail('e1'), Result.ok(2)];
        const allFails: Result<string, number>[] = [Result.fail('e1'), Result.fail('e2')];
        assert.deepStrictEqual(Result.all(allOks).orError(), [1,2,3]);
        assert.deepStrictEqual(Result.all(someOks).error.orElse([]).map(error => error.orNull()), [null, 'e1', null]);
        assert.deepStrictEqual(Result.all(allFails).error.orElse([]).map(error => error.orNull()), ['e1', 'e2']);
    });
});
