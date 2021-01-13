import { Result } from './result';
export { Result } from './result';
export declare type Primitive = string | number | boolean;
export declare type Json = Primitive | Primitive[] | {
    [field: string]: Json;
} | {
    [field: string]: Json;
}[];
export declare class Optional<T> {
    private value;
    constructor(value: T | null | undefined);
    static of<T>(v: T | null | undefined): Optional<T>;
    static empty<T>(): Optional<T>;
    get present(): boolean;
    orElse(others: T): T;
    orNull(): T | null;
    orExec(func: () => T): T | null | undefined;
    orFail<E>(error: E): Result<E, T>;
    /** get value or throw an error */
    orError<E>(error: E): T;
    map<R>(f: (a: T) => R): Optional<R>;
    /** alias of Optional.map() */
    ifPresent<R>(f: (a: T) => R): Optional<R>;
    chain<R>(f: (a: T) => Optional<R>): Optional<R>;
    static all<T1, T2>(values: [Optional<T1>, Optional<T2>]): Optional<[T1, T2]>;
    static all<T1, T2, T3>(values: [Optional<T1>, Optional<T2>, Optional<T3>]): Optional<[T1, T2, T3]>;
    static all<T1, T2, T3, T4>(values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>]): Optional<[T1, T2, T3, T4]>;
    static all<T1, T2, T3, T4, T5>(values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>]): Optional<[T1, T2, T3, T4, T5]>;
    static all<T1, T2, T3, T4, T5, T6>(values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>]): Optional<[T1, T2, T3, T4, T5, T6]>;
    static all<T1, T2, T3, T4, T5, T6, T7>(values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>, Optional<T7>]): Optional<[T1, T2, T3, T4, T5, T6, T7]>;
    static all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>, Optional<T7>, Optional<T8>]): Optional<[T1, T2, T3, T4, T5, T6, T7, T8]>;
    static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>, Optional<T7>, Optional<T8>, Optional<T9>]): Optional<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
    static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>, Optional<T7>, Optional<T8>, Optional<T9>, Optional<T10>]): Optional<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
    static all<T>(values: Optional<T>[]): Optional<T[]>;
    static filter<T>(list: Optional<T>[]): T[];
    static fetchFilter<T, S>(list: T[], fetch: (item: T) => Optional<S>): {
        data: S;
        src: T;
    }[];
}
export declare class List<T> extends Array<T> {
    static of<T>(...data: T[]): List<T>;
    static make<T>(data: T[]): List<T>;
    map<S>(f: (v: T, index: number, array: T[]) => S): List<S>;
    filter(f: any): List<T>;
    chain<S>(f: (v: T) => S[]): List<S>;
}
export declare class IO<T> {
    exec: () => T;
    constructor(data: () => T);
    static of<T>(res: T): IO<T>;
    map<R>(f: (p: T) => R): IO<R>;
    chain<R>(f: (p: T) => IO<R>): IO<R>;
}
export declare class PromiseOptional<T> {
    data: Promise<Optional<T>>;
    constructor(data: Promise<Optional<T>>);
    static make<T>(data: Optional<T>): PromiseOptional<T>;
    static make<T>(data: Promise<Optional<T>>): PromiseOptional<T>;
    map<R>(f: (p: T) => R): PromiseOptional<R>;
    chain<R>(f: (p: T) => PromiseOptional<R>): PromiseOptional<R>;
    chain<R>(f: (p: T) => Promise<Optional<R>>): PromiseOptional<R>;
    orElse(other: T): Promise<T>;
    orFail<E>(error: E): PromiseResult<E, T>;
}
export declare class PromiseResult<E, T> {
    data: Promise<Result<E, T>>;
    constructor(data: Promise<Result<E, T>>);
    static make<E, T>(data: Result<E, T>): PromiseResult<E, T>;
    static make<E, T>(data: Promise<Result<E, T>>): PromiseResult<E, T>;
    map<R>(f: (p: T) => R): PromiseResult<E, R>;
    chain<R>(f: (p: T) => PromiseResult<E, R>): PromiseResult<E, R>;
    chain<R>(f: (p: T) => Promise<Result<E, R>>): PromiseResult<E, R>;
    either<R>(f: (e: E) => R, g: (v: T) => R): Promise<R>;
}
/**
參考 https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch10.html
 */
export declare function liftA2<A, B, C>(fun: (a: A, b: B) => C, a: Optional<A>, b: Optional<B>): Optional<C>;
export declare function liftA2<A, B, C, E>(fun: (a: A, b: B) => C, a: Result<E, A>, b: Result<E, B>): Result<E, C>;
export declare function liftA2<A, B, C>(fun: (a: A, b: B) => C, a: List<A>, b: List<B>): List<C>;
export declare function liftA2<A, B, C>(fun: (a: A, b: B) => C, a: IO<A>, b: IO<B>): IO<C>;
export declare function liftA3<A, B, C, D>(fun: (a: A, b: B, c: C) => D, a: Optional<A>, b: Optional<B>, c: Optional<C>): Optional<D>;
export declare function liftA3<A, B, C, D, E>(fun: (a: A, b: B, c: C) => D, a: Result<E, A>, b: Result<E, B>, c: Result<E, C>): Result<E, D>;
export declare function liftA3<A, B, C, D>(fun: (a: A, b: B, c: C) => D, a: List<A>, b: List<B>, c: List<C>): List<D>;
export declare function liftA3<A, B, C, D>(fun: (a: A, b: B, c: C) => D, a: IO<A>, b: IO<B>, c: IO<C>): IO<D>;
export declare function liftA4<A, B, C, D, E>(fun: (a: A, b: B, c: C, d: D) => E, a: Optional<A>, b: Optional<B>, c: Optional<C>, d: Optional<D>): Optional<E>;
export declare function liftA4<A, B, C, D, E, F>(fun: (a: A, b: B, c: C, d: D) => E, a: Result<F, A>, b: Result<F, B>, c: Result<F, C>, d: Result<F, D>): Result<F, E>;
export declare function liftA4<A, B, C, D, E>(fun: (a: A, b: B, c: C, d: D) => E, a: List<A>, b: List<B>, c: List<C>, d: Optional<D>): List<E>;
export declare function liftA4<A, B, C, D, E>(fun: (a: A, b: B, c: C, d: D) => E, a: IO<A>, b: IO<B>, c: IO<C>, d: Optional<D>): IO<E>;
