"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liftA4 = exports.liftA3 = exports.liftA2 = exports.PromiseResult = exports.PromiseOptional = exports.IO = exports.List = exports.Result = exports.Optional = void 0;
const optional_1 = require("./optional");
var optional_2 = require("./optional");
Object.defineProperty(exports, "Optional", { enumerable: true, get: function () { return optional_2.Optional; } });
const result_1 = require("./result");
var result_2 = require("./result");
Object.defineProperty(exports, "Result", { enumerable: true, get: function () { return result_2.Result; } });
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
        if (data instanceof optional_1.Optional) {
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
            .orElse(Promise.resolve(optional_1.Optional.empty())));
        return new PromiseOptional(res);
    }
    orElse(other) {
        return this.data.then(d => d.orElse(other));
    }
    orFail(error) {
        return PromiseResult.make(this.map(data => result_1.Result.ok(data)).orElse(result_1.Result.fail(error)));
    }
}
exports.PromiseOptional = PromiseOptional;
class PromiseResult {
    constructor(data) {
        this.data = data;
    }
    static make(data) {
        if (result_1.Result.isa(data)) {
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
        let res = this.data.then(d => d.map(mapper).either(err => Promise.resolve(result_1.Result.fail(err)), data => data));
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
