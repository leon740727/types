function _assert(state: boolean, msg: string) {
    if (!state) {
        throw msg;
    }
}

export type Jsonable = {[field: string]: any} | any [];

export class Optional<T> {
    private value: T;
    constructor(value: T) {
        this.value = value;
    }

    static of<U>(v: U) {
        /** 可傳入 v:U 或 null 或 undefined */
        return new Optional<U>(v);
    }
    static empty() {
        return new Optional(null);
    }
    jsonable(transformer: (data: T) => Jsonable): Jsonable {
        return this.value == null ? null : transformer(this.value);
    }
    static restore<T>(data: Jsonable, transformer: (data: Jsonable) => T): Optional<T> {
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
    map<R>(f: (a: T) => R): Optional<R> {
        return this.is_present() ? Optional.of(f(this.value)) : Optional.empty();
    }
    chain<R>(f: (a: T) => Optional<R>): Optional<R> {
        return this.is_present() ? f(this.value) : Optional.empty();
    }

    static cat<T>(list: Optional<T>[]): T[] {
        return list.filter(i => i.is_present()).map(i => i.get());
    }
}

export class Result<E, T> {
    ok: boolean;
    private value: T;
    private error: E;
    constructor(ok: boolean, error: E, value: T) {
        this.ok = ok;
        this.value = value;
        this.error = error;
    }
    static ok<E,T>(v: T) {
        return new Result(true, null, v);
    }
    static fail<E,T>(e: E) {
        return new Result(false, e, null);
    }
    jsonable(errorT: (error: E) => Jsonable, valueT: (data: T) => Jsonable): Jsonable {
        if (this.ok) {
            return [null, valueT(this.value)];
        } else {
            return [errorT(this.error), null];
        }
    }
    static restore<E, T>(data: Jsonable, errorT: (error: Jsonable) => E, valueT: (data: Jsonable) => T): Result<E, T> {
        if (data[0] === null) {
            return Result.ok(valueT(data[1]));
        } else {
            return Result.fail(errorT(data[0]));
        }
    }
    map<R>(f:(v:T)=>R): Result<E,R> {
        if (this.ok) {
            return Result.ok(f(this.value));
        } else {
            return Result.fail(this.error);
        }
    }
    chain<R>(f:(v:T)=>Result<E,R>): Result<E,R> {
        if (this.ok) {
            return f(this.value);
        } else {
            return Result.fail(this.error);
        }
    }
    get fail() {
        return ! this.ok;
    }
    get() {
        _assert(this.ok, "Result 不 ok");
        return this.value;
    }
    get_error() {
        _assert(!this.ok, "Result 不 fail");
        return this.error;
    }
    either<R>(f:(e:E)=>R, g:(v:T)=>R): R {
        if (this.ok) {
            return g(this.value);
        } else {
            return f(this.error);
        }
    }

    static cat<E,T>(list: Result<E,T>[]): T[] {
        return list.filter(r => r.ok).map(r => r.get());
    }
}

export class List<T> extends Array<T> {
    static of<T>(set: Set<T>): List<T>;
    static of<T>(data: T[]): List<T>;
    static of<T>(data): List<T> {
        let res = new List<T>();
        if (data instanceof Array) {
            data.forEach(i => res.push(i));
        } else if (data instanceof Set) {
            Array.from((<Set<T>>data).values()).forEach(i => res.push(i));
        } else {
            throw 'List.of 只接受 Array, Set 類型的參數';
        }
        return res;
    }
    chain<R>(f: (i: T) => R[]) {
        function flatten<T>(listOfList: T[][]) {
            let res: T[] = [];
            listOfList.forEach(list => list.forEach(i => res.push(i)));
            return res;
        }
        return List.of(flatten(this.map(f)));
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

export function makePromise<T>(data: T) {
    return new Promise<T>((resolve, reject) => resolve(data));
}

export class PromiseOptional<T> {
    data: Promise<Optional<T>>;
    constructor(data: Promise<Optional<T>>) {
        this.data = data;
    }
    static make<T>(data: Promise<Optional<T>>) {
        return new PromiseOptional(data);
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
             .or_else(makePromise(Optional.empty())));
        return new PromiseOptional(res);
    }
    or_else(other: T): Promise<T> {
        return this.data.then(d => d.is_present() ? d.get() : other);
    }
}

export class PromiseResult<E, T> {
    data: Promise<Result<E, T>>;
    constructor(data: Promise<Result<E, T>>) {
        this.data = data;
    }
    static make<E, T>(data: Promise<Result<E, T>>) {
        return new PromiseResult(data);
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
                err => makePromise(<Result<E,R>>Result.fail(err)),
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
