"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liftA4 = exports.liftA3 = exports.liftA2 = exports.PromiseResult = exports.PromiseOptional = exports.IO = exports.List = exports.Result = exports.Optional = void 0;
function zip(a, b) {
    let results = [];
    const len = Math.min(a.length, b.length);
    let idx = 0;
    while (idx < len) {
        results[idx] = [a[idx], b[idx]];
        idx += 1;
    }
    return results;
}
class Optional {
    constructor(value) {
        this.value = value;
    }
    static of(v) {
        return new Optional(v);
    }
    static empty() {
        return new Optional(null);
    }
    get present() {
        return this.value !== null && this.value !== undefined;
    }
    or_else(others) {
        return this.present ? this.value : others;
    }
    or_null() {
        return this.present ? this.value : null;
    }
    or_exec(func) {
        // 無論 Optional 是否有值，or_else 裡面的表達式都會被求值
        // 例如: doc.or_else(load_default()) 不論 doc 是否有值，load_default 都會執行
        // 如果不希望 or_else 裡面的表達式被無謂求值，就用 or_exec
        return this.present ? this.value : func();
    }
    or_fail(error) {
        return this.present ? Result.ok(this.value) : Result.fail(error);
    }
    /** get value or throw an error */
    or_error(error) {
        if (this.present) {
            return this.value;
        }
        else {
            throw error;
        }
    }
    map(f) {
        return this.present ? Optional.of(f(this.value)) : Optional.empty();
    }
    if_present(f) {
        // something.if_present 跟 something.map 的作用一樣，但提供比較清楚的語意
        // 讓使用者不用再寫 if (xxx.is_present()) { xxx.get() } 的程式碼
        return this.map(f);
    }
    chain(f) {
        return this.present ? f(this.value) : Optional.empty();
    }
    static all(values) {
        const results = Optional.cat(values);
        return results.length === values.length ? Optional.of(results) : Optional.empty();
    }
    static cat(list) {
        return list.filter(i => i.present).map(i => i.or_null());
    }
    static fetchCat(list, fetch) {
        return zip(list, list.map(fetch).map(prop => prop.or_null()))
            .filter(([item, prop]) => prop !== null)
            .map(([item, prop]) => ({ data: prop, src: item }));
    }
}
exports.Optional = Optional;
class Result {
    constructor(_error, _value) {
        this._error = _error;
        this._value = _value;
    }
    get value() {
        return this._value;
    }
    get error() {
        return this._error;
    }
    get ok() {
        return this.value.present;
    }
    get fail() {
        return !this.ok;
    }
    static ok(v) {
        return new Result(Optional.empty(), Optional.of(v));
    }
    static fail(e) {
        return new Result(Optional.of(e), Optional.empty());
    }
    map(f) {
        if (this.ok) {
            return Result.ok(f(this.value.or_error('wont happened')));
        }
        else {
            return Result.fail(this.error.or_error('wont happened'));
        }
    }
    chain(f) {
        if (this.ok) {
            return f(this.value.or_error('wont happened'));
        }
        else {
            return Result.fail(this.error.or_error('wont happened'));
        }
    }
    if_ok(f) {
        // result.if_ok 跟 result.map 的作用一樣，但提供比較清楚的語意
        // 讓使用者不用再寫 if (xxx.ok) { xxx.get() } 的程式碼
        return this.map(f);
    }
    if_error(f) {
        if (this.ok) {
            return Result.ok(this.value.or_error('wont happened'));
        }
        else {
            return Result.fail(f(this.error.or_error('wont happened')));
        }
    }
    either(f, g) {
        if (this.ok) {
            return g(this.value.or_error('wont happened'));
        }
        else {
            return f(this.error.or_error('wont happened'));
        }
    }
    or_else(others) {
        return this.ok ? this.value.or_error('wont happened') : others;
    }
    /** get value or throw error */
    or_error() {
        if (this.ok) {
            return this.value.or_error('wont happened');
        }
        else {
            throw this._error;
        }
    }
    static all(values) {
        const results = Result.cat(values);
        if (results.length === values.length) {
            return Result.ok(results);
        }
        else {
            return Result.fail(values.map(v => v.error));
        }
    }
    static cat(list) {
        return list.filter(r => r.ok).map(r => r.or_error());
    }
}
exports.Result = Result;
class List extends Array {
    /* https://stackoverflow.com/questions/14000645/how-to-extend-native-javascript-array-in-typescript */
    static of(...data) {
        return new List(...data);
    }
    static make(data) {
        return new List(...data);
    }
    map(f) {
        return List.make(super.map(f));
    }
    filter(f) {
        return List.make(super.filter(f));
    }
    chain(f) {
        const res = this
            .map(f)
            .reduce((acc, i) => acc.concat(i), []);
        return List.make(res);
    }
}
exports.List = List;
class IO {
    constructor(data) {
        this.exec = data;
    }
    static of(res) {
        return new IO(() => res);
    }
    map(f) {
        return new IO(() => f(this.exec()));
    }
    chain(f) {
        let o = new IO(() => f(this.exec()));
        return o.exec();
    }
}
exports.IO = IO;
class PromiseOptional {
    constructor(data) {
        this.data = data;
    }
    static make(data) {
        if (data instanceof Optional) {
            return new PromiseOptional(Promise.resolve(data));
        }
        else {
            return new PromiseOptional(data);
        }
    }
    map(f) {
        return new PromiseOptional(this.data.then(d => d.map(f)));
    }
    chain(f) {
        function mapper(p) {
            let res = f(p);
            if (res instanceof PromiseOptional) {
                return res.data;
            }
            else {
                return res;
            }
        }
        let res = this.data.then(d => d.map(mapper)
            .or_else(Promise.resolve(Optional.empty())));
        return new PromiseOptional(res);
    }
    or_else(other) {
        return this.data.then(d => d.or_else(other));
    }
    or_fail(error) {
        return PromiseResult.make(this.map(data => Result.ok(data)).or_else(Result.fail(error)));
    }
}
exports.PromiseOptional = PromiseOptional;
class PromiseResult {
    constructor(data) {
        this.data = data;
    }
    static make(data) {
        if (data instanceof Result) {
            return new PromiseResult(Promise.resolve(data));
        }
        else {
            return new PromiseResult(data);
        }
    }
    map(f) {
        return new PromiseResult(this.data.then(d => d.map(f)));
    }
    chain(f) {
        function mapper(p) {
            let res = f(p);
            if (res instanceof PromiseResult) {
                return res.data;
            }
            else {
                return res;
            }
        }
        let res = this.data.then(d => d.map(mapper).either(err => Promise.resolve(Result.fail(err)), data => data));
        return new PromiseResult(res);
    }
    either(f, g) {
        return this.data.then(r => r.either(f, g));
    }
}
exports.PromiseResult = PromiseResult;
function _arity(n, fn) {
    /* eslint-disable no-unused-vars */
    switch (n) {
        case 0: return function () { return fn.apply(this, arguments); };
        case 1: return function (a0) { return fn.apply(this, arguments); };
        case 2: return function (a0, a1) { return fn.apply(this, arguments); };
        case 3: return function (a0, a1, a2) { return fn.apply(this, arguments); };
        case 4: return function (a0, a1, a2, a3) { return fn.apply(this, arguments); };
        case 5: return function (a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
        case 6: return function (a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
        case 7: return function (a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
        case 8: return function (a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
        case 9: return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
        case 10: return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
        default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
    }
}
;
function curry(func) {
    return (...args) => {
        if (args.length >= func.length) {
            return func.apply(null, args);
        }
        else {
            let newf = (...arg2s) => func.apply(null, args.concat(arg2s));
            return curry(_arity(func.length - args.length, newf));
        }
    };
}
function liftA2(fun, a, b) {
    let f = curry(fun);
    return a.chain(a => b.map(f(a)));
}
exports.liftA2 = liftA2;
function liftA3(fun, a, b, c) {
    let f = curry(fun);
    return liftA2(f, a, b).chain(r => c.map(r));
}
exports.liftA3 = liftA3;
function liftA4(fun, a, b, c, d) {
    let f = curry(fun);
    return liftA3(f, a, b, c).chain(r => d.map(r));
}
exports.liftA4 = liftA4;
