"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../src/index");
describe('result', () => {
    it('fail', () => {
        const r = index_1.Result.fail('fail');
        assert.ok(r.ok === false);
        assert.ok(r.value.or_null() === null);
        assert.ok(r.error.or_null() === 'fail');
    });
    it('ok', () => {
        const r = index_1.Result.ok(5);
        assert.ok(r.ok === true);
        assert.ok(r.value.or_null() === 5);
        assert.ok(r.error.or_null() === null);
    });
    it('map & chain', () => {
        const r = index_1.Result.ok(5);
        assert.ok(r.map(n => `five ${n}`).value.or_null() === 'five 5');
        assert.ok(r.chain(n => index_1.Result.ok(`five ${n}`)).value.or_null() === 'five 5');
    });
});
