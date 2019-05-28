function _assert(state: boolean, msg: string) {
    if (!state) {
        throw msg;
    }
}

export type Primitive = string | number | boolean;
export type Json = Primitive | Primitive[] | {[field: string]: Json} | {[field: string]: Json}[];

function zip <T, S> (a: T[], b: S[]): [T, S][] {
    let results: [T, S][] = [];
    const len = Math.min(a.length, b.length);
    let idx = 0;
    while (idx < len) {
        results[idx] = [a[idx], b[idx]];
        idx += 1;
    }
    return results;
}

export class Optional<T> {
    private value: T;
    constructor(value: T) {
        this.value = value;
    }

    static of<U>(v: U) {
        /** 可傳入 v:U 或 null 或 undefined */
        return new Optional<U>(v);
    }
    static empty <T> (): Optional<T> {
        return new Optional(null);
    }
    jsonable(transformer: (data: T) => Json): Json {
        return this.value == null ? null : transformer(this.value);
    }
    static restore<T>(data: Json, transformer: (data: Json) => T): Optional<T> {
        return Optional.of(data).map(transformer);
    }
    is_present() {
        return this.value !== null && this.value !== undefined;
    }
    get(): T {
        _assert(this.is_present(), "NULL ERROR!!");
        return this.value;
    }
    or_else(others: T) {
        return this.is_present() ? this.value : others;
    }
    or_exec(func: () => T) {
        // 無論 Optional 是否有值，or_else 裡面的表達式都會被求值
        // 例如: doc.or_else(load_default()) 不論 doc 是否有值，load_default 都會執行
        // 如果不希望 or_else 裡面的表達式被無謂求值，就用 or_exec
        return this.is_present() ? this.value : func();
    }
    or_fail<E>(error: E): Result<E, T> {
        return this.is_present() ? Result.ok(this.value) : Result.fail(error);
    }
    map<R>(f: (a: T) => R): Optional<R> {
        return this.is_present() ? Optional.of(f(this.value)) : Optional.empty();
    }
    if_present<R>(f: (a: T) => R): Optional<R> {
        // something.if_present 跟 something.map 的作用一樣，但提供比較清楚的語意
        // 讓使用者不用再寫 if (xxx.is_present()) { xxx.get() } 的程式碼
        return this.map(f);
    }
    chain<R>(f: (a: T) => Optional<R>): Optional<R> {
        return this.is_present() ? f(this.value) : Optional.empty();
    }

    static cat<T>(list: Optional<T>[]): T[] {
        return list.filter(i => i.is_present()).map(i => i.get());
    }

    static fetchCat <T, S> (list: T[], fetch: (item: T) => Optional<S>): {data: S, src: T}[] {
        return zip(
            list,
            list.map(fetch).map(prop => prop.or_else(null)))
        .filter(([item, prop]) => prop !== null)
        .map(([item, prop]) => ({data: prop, src: item}));
    }
}

export class Result <E, T> {

    constructor (private _error: E, private _value: T) {}

    get value (): Optional<T> {
        return Optional.of(this._value);
    }

    get error (): Optional<E> {
        return Optional.of(this._error);
    }

    get ok (): boolean {
        return this._error === null;
    }

    get fail (): boolean {
        return ! this.ok;
    }

    static ok <E, T> (v: T): Result<E, T> {
        return new Result(null, v);
    }

    static fail <E, T> (e: E): Result<E, T> {
        return new Result(e, null);
    }

    jsonable (errorT: (error: E) => Json, valueT: (data: T) => Json): Json[] {
        if (this.ok) {
            return [null, valueT(this._value)];
        } else {
            return [errorT(this._error), null];
        }
    }

    static restore <E, T> (data: Json[], errorT: (error: Json) => E, valueT: (data: Json) => T): Result<E, T> {
        if (data[0] === null) {
            return Result.ok(valueT(data[1]));
        } else {
            return Result.fail(errorT(data[0]));
        }
    }

    map <R> (f:(v:T)=>R): Result<E,R> {
        if (this.ok) {
            return Result.ok(f(this._value));
        } else {
            return Result.fail(this._error);
        }
    }

    chain <E2, R> (f: (v:T) => Result <E2, R>): Result <E|E2, R> {
        if (this.ok) {
            return f(this._value);
        } else {
            return Result.fail(this._error);
        }
    }

    if_ok <R> (f:(v:T)=>R): Result<E,R> {
        // result.if_ok 跟 result.map 的作用一樣，但提供比較清楚的語意
        // 讓使用者不用再寫 if (xxx.ok) { xxx.get() } 的程式碼
        return this.map(f);
    }

    if_error <R> (f:(v:E)=>R): Result<R,T> {
        if (this.ok) {
            return Result.ok(this._value);
        } else {
            return Result.fail(f(this._error));
        }
    }

    get () {
        _assert(this.ok, "Result 不 ok");
        return this._value;
    }

    get_error () {
        _assert(!this.ok, "Result 不 fail");
        return this._error;
    }

    either <R> (f:(e:E)=>R, g:(v:T)=>R): R {
        if (this.ok) {
            return g(this._value);
        } else {
            return f(this._error);
        }
    }

    or_else (others: T): T {
        return this.ok ? this._value : others;
    }

    static cat <E,T> (list: Result<E,T>[]): T[] {
        return list.filter(r => r.ok).map(r => r.get());
    }
}

export class List <T> extends Array <T> {
    /* https://stackoverflow.com/questions/14000645/how-to-extend-native-javascript-array-in-typescript */

    static of <T> (...data: T[]): List <T> {
        return new List(...data);
    }

    static make <T> (data: T[]): List <T> {
        return new List(...data);
    }

    map <S> (f: (v: T, index: number, array: T[]) => S): List <S> {
        return List.make(super.map(f));
    }

    filter (f): List <T> {
        return List.make(super.filter(f));
    }

    chain <S> (f: (v: T) => S[]): List <S> {
        const res = this
            .map(f)
            .reduce((acc, i) => acc.concat(i), []);
        return List.make(res);
    }
}

export class IO<T> {
    exec: () => T;
    constructor(data: ()=>T) {
        this.exec = data;
    }
    static of<T>(res: T) {
        return new IO(() => res);
    }

    map<R>(f: (p:T) => R) {
        return new IO(() => f(this.exec()));
    }

    chain<R>(f: (p:T) => IO<R>) {
        let o = new IO(() => f(this.exec()));
        return o.exec();
    }
}

export class PromiseOptional<T> {
    data: Promise<Optional<T>>;
    constructor(data: Promise<Optional<T>>) {
        this.data = data;
    }
    static make<T>(data: Optional<T>): PromiseOptional<T>;
    static make<T>(data: Promise<Optional<T>>): PromiseOptional<T>;
    static make<T>(data) {
        if (data instanceof Optional) {
            return new PromiseOptional(Promise.resolve(data));
        } else {
            return new PromiseOptional(data);
        }
    }
    map<R>(f: (p: T) => R): PromiseOptional<R> {
        return new PromiseOptional(this.data.then(d => d.map(f)));
    }
    chain<R>(f: (p: T) => PromiseOptional<R>): PromiseOptional<R>;
    chain<R>(f: (p: T) => Promise<Optional<R>>): PromiseOptional<R>;
    chain<R>(f: (p: T) => any): PromiseOptional<R> {
        function mapper(p: T): Promise<Optional<R>> {
            let res = f(p);
            if (res instanceof PromiseOptional) {
                return res.data;
            } else {
                return res;
            }
        }
        let res = this.data.then(d =>
            d.map(mapper)
             .or_else(Promise.resolve(Optional.empty())));
        return new PromiseOptional(res);
    }
    or_else(other: T): Promise<T> {
        return this.data.then(d => d.is_present() ? d.get() : other);
    }
    or_fail<E>(error: E): PromiseResult<E, T> {
        return PromiseResult.make(this.map(data => Result.ok(data)).or_else(Result.fail(error)));
    }
}

export class PromiseResult<E, T> {
    data: Promise<Result<E, T>>;
    constructor(data: Promise<Result<E, T>>) {
        this.data = data;
    }
    static make<E, T>(data: Result<E, T>): PromiseResult<E, T>;
    static make<E, T>(data: Promise<Result<E, T>>): PromiseResult<E, T>;
    static make<E, T>(data) {
        if (data instanceof Result) {
            return new PromiseResult(Promise.resolve(data));
        } else {
            return new PromiseResult(data);
        }
    }
    map<R>(f: (p: T) => R): PromiseResult<E, R> {
        return new PromiseResult(this.data.then(d => d.map(f)));
    }
    chain<R>(f: (p: T) => PromiseResult<E, R>): PromiseResult<E, R>;
    chain<R>(f: (p: T) => Promise<Result<E, R>>): PromiseResult<E, R>
    chain<R>(f: (p: T) => any): PromiseResult<E, R> {
        function mapper(p: T): Promise<Result<E, R>> {
            let res = f(p);
            if (res instanceof PromiseResult) {
                return res.data;
            } else {
                return res;
            }
        }
        let res = this.data.then(d =>
            d.map(mapper).either(
                err => Promise.resolve(<Result<E,R>>Result.fail(err)),
                data => data));
        return new PromiseResult(res);
    }
    either<R>(f:(e:E)=>R, g:(v:T)=>R): Promise<R> {
        return this.data.then(r => r.either(f, g));
    }
}

function _arity(n, fn) {
    /* eslint-disable no-unused-vars */
    switch (n) {
        case 0: return function() { return fn.apply(this, arguments); };
        case 1: return function(a0) { return fn.apply(this, arguments); };
        case 2: return function(a0, a1) { return fn.apply(this, arguments); };
        case 3: return function(a0, a1, a2) { return fn.apply(this, arguments); };
        case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments); };
        case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
        case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
        case 7: return function(a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
        case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
        case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
        case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
        default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
    }
};
function curry(func: (...args)=>any) {
    return (...args) => {
        if (args.length >= func.length) {
            return func.apply(null, args);
        } else {
            let newf = (...arg2s) => func.apply(null, args.concat(arg2s));
            return curry(_arity(func.length - args.length, newf));
        }
    }
}

/**
參考 https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch10.html
 */
export function liftA2<A,B,C>(fun:(a:A, b:B)=>C, a:Optional<A>, b:Optional<B>): Optional<C>;
export function liftA2<A,B,C,E>(fun:(a:A, b:B)=>C, a:Result<E,A>, b:Result<E,B>): Result<E,C>;
export function liftA2<A,B,C>(fun:(a:A, b:B)=>C, a:List<A>, b:List<B>): List<C>;
export function liftA2<A,B,C>(fun:(a:A, b:B)=>C, a:IO<A>, b:IO<B>): IO<C>;
export function liftA2<A,B,C>(fun:(a:A, b:B)=>C, a, b) {
    let f = <(a:A)=>(b:B)=>C> curry(fun);
    return a.chain(a => b.map(f(a)));
}
export function liftA3<A,B,C,D>(fun:(a:A, b:B, c:C)=>D, a:Optional<A>, b:Optional<B>, c:Optional<C>):Optional<D>;
export function liftA3<A,B,C,D,E>(fun:(a:A, b:B, c:C)=>D, a:Result<E,A>, b:Result<E,B>, c:Result<E,C>):Result<E,D>;
export function liftA3<A,B,C,D>(fun:(a:A, b:B, c:C)=>D, a:List<A>, b:List<B>, c:List<C>):List<D>;
export function liftA3<A,B,C,D>(fun:(a:A, b:B, c:C)=>D, a:IO<A>, b:IO<B>, c:IO<C>):IO<D>;
export function liftA3<A,B,C,D>(fun:(a:A, b:B, c:C)=>D, a, b, c) {
    let f = <(a:A,b:B)=>(c:C)=>D> curry(fun);
    return (<any>liftA2(f,a,b)).chain(r => c.map(r));
}
export function liftA4<A,B,C,D,E>(fun:(a:A, b:B, c:C, d:D)=>E, a:Optional<A>, b:Optional<B>, c:Optional<C>, d: Optional<D>):Optional<E>;
export function liftA4<A,B,C,D,E,F>(fun:(a:A, b:B, c:C, d:D)=>E, a:Result<F,A>, b:Result<F,B>, c:Result<F,C>, d:Result<F,D>):Result<F,E>;
export function liftA4<A,B,C,D,E>(fun:(a:A, b:B, c:C, d:D)=>E, a:List<A>, b:List<B>, c:List<C>, d: Optional<D>):List<E>;
export function liftA4<A,B,C,D,E>(fun:(a:A, b:B, c:C, d:D)=>E, a:IO<A>, b:IO<B>, c:IO<C>, d: Optional<D>):IO<E>;
export function liftA4<A,B,C,D,E>(fun:(a:A, b:B, c:C, d:D)=>E, a, b, c, d) {
    let f = <(a:A,b:B,c:C)=>(d:D)=>E> curry(fun);
    return (<any>liftA3(f,a,b,c)).chain(r => d.map(r));
}
