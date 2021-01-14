import { Optional } from './optional';
export { Optional } from './optional';
import { Result } from './result';
export { Result } from './result';

export type Primitive = string | number | boolean;
export type Json = Primitive | Primitive[] | {[field: string]: Json} | {[field: string]: Json}[];

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
             .orElse(Promise.resolve(Optional.empty())));
        return new PromiseOptional(res);
    }

    orElse(other: T): Promise<T> {
        return this.data.then(d => d.orElse(other));
    }

    orFail<E>(error: E): PromiseResult<E, T> {
        return PromiseResult.make(this.map(data => Result.ok<E, T>(data)).orElse(Result.fail(error)));
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
        if (Result.isa(data)) {
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
