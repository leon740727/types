"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../src/index");
describe('result', () => {
    it('fail', () => {
        const r = index_1.Result.fail('fail');
        assert.ok(r.ok === false);
        assert.ok(r.value.orNull() === null);
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
    it('ok', () => {
        const r = index_1.Result.ok(5);
        assert.ok(r.ok === true);
        assert.ok(r.orElse(0) === 5);
        assert.ok(r.orError() === 5);
        assert.ok(r.value.orNull() === 5);
        assert.ok(r.error.orNull() === null);
    });
    it('map & chain', () => {
        const r = index_1.Result.ok(5);
        assert.ok(r.map(n => `five ${n}`).value.orNull() === 'five 5');
        assert.ok(r.chain(n => index_1.Result.ok(`five ${n}`)).value.orNull() === 'five 5');
    });
});
