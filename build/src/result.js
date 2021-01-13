"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
const index_1 = require("./index");
var Result;
(function (Result) {
    function ok(value) {
        return new Ok(value);
    }
    Result.ok = ok;
    function fail(error) {
        return new Fail(error);
    }
    Result.fail = fail;
    function isa(object) {
        return object instanceof Ok || object instanceof Fail;
    }
    Result.isa = isa;
    function all(values) {
        const results = filter(values);
        if (results.length === values.length) {
            return ok(results);
        }
        else {
            return fail(values.map(v => v.error));
        }
    }
    Result.all = all;
    function filter(list) {
        return list.filter(i => i.ok).map(i => i.orError());
    }
    Result.filter = filter;
})(Result = exports.Result || (exports.Result = {}));
class Ok {
    constructor(_value) {
        this._value = _value;
    }
    get ok() {
        return true;
    }
    get fail() {
        return false;
    }
    get value() {
        return index_1.Optional.of(this._value);
    }
    get error() {
        return index_1.Optional.empty();
    }
    map(fn) {
        return new Ok(fn(this._value));
    }
    chain(fn) {
        return fn(this._value);
    }
    ifOk(fn) {
        return this.map(fn);
    }
    ifError(fn) {
        return new Ok(this._value);
    }
    either(errorHandler, valueHandler) {
        return valueHandler(this._value);
    }
    orElse(others) {
        return this._value;
    }
    orError() {
        return this._value;
    }
}
class Fail {
    constructor(_error) {
        this._error = _error;
        if (this._error === null) {
            throw new Error('error value in Result.fail(error) could not be null');
        }
    }
    get ok() {
        return false;
    }
    get fail() {
        return true;
    }
    get value() {
        return index_1.Optional.empty();
    }
    get error() {
        return index_1.Optional.of(this._error);
    }
    map(fn) {
        return new Fail(this._error);
    }
    chain(fn) {
        return new Fail(this._error);
    }
    ifOk(fn) {
        return this.map(fn);
    }
    ifError(fn) {
        const e2 = fn(this._error);
        if (e2 === null) {
            // newError 不能是 null，因為這會改變 Result 的狀態，但卻沒有明確指定一個 right value 給 right Result
            throw new Error('function argument in Result.ifError() could not return null');
        }
        return new Fail(e2);
    }
    either(errorHandler, valueHandler) {
        return errorHandler(this._error);
    }
    orElse(others) {
        return others;
    }
    orError() {
        throw this._error;
    }
}
