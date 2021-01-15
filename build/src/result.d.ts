import { Optional } from './index';
export interface Result<E, T> {
    readonly ok: boolean;
    readonly fail: boolean;
    readonly value: Optional<T>;
    readonly error: Optional<E>;
    map(fn: (value: T) => undefined | void | T): Result<E, T>;
    map<T2>(fn: (value: T) => T2): Result<E, T2>;
    chain<E2, T2>(fn: (value: T) => Result<E2, T2>): Result<E | E2, T2>;
    /** alias of map() */
    ifOk(fn: (value: T) => undefined | void | T): Result<E, T>;
    ifOk<T2>(fn: (value: T) => T2): Result<E, T2>;
    ifFail(fn: (error: E) => undefined | void | T): Result<E, T>;
    ifFail<E2>(fn: (error: E) => E2): Result<E2, T>;
    either<R>(errorHandler: (error: E) => R, valueHandler: (value: T) => R): R;
    orElse(others: T): T;
    /** get value or throw error */
    orError(): T;
}
export declare namespace Result {
    function ok<E, T>(value: T): Result<E, T>;
    function fail<E, T>(error: E): Result<E, T>;
    function isa(object: any): boolean;
    function all<T1, T2, E>(values: [Result<E, T1>, Result<E, T2>]): Result<Optional<E>[], [T1, T2]>;
    function all<T1, T2, T3, E>(values: [Result<E, T1>, Result<E, T2>, Result<E, T3>]): Result<Optional<E>[], [T1, T2, T3]>;
    function all<T1, T2, T3, T4, E>(values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>]): Result<Optional<E>[], [T1, T2, T3, T4]>;
    function all<T1, T2, T3, T4, T5, E>(values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>]): Result<Optional<E>[], [T1, T2, T3, T4, T5]>;
    function all<T1, T2, T3, T4, T5, T6, E>(values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6]>;
    function all<T1, T2, T3, T4, T5, T6, T7, E>(values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>, Result<E, T7>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6, T7]>;
    function all<T1, T2, T3, T4, T5, T6, T7, T8, E>(values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>, Result<E, T7>, Result<E, T8>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6, T7, T8]>;
    function all<T1, T2, T3, T4, T5, T6, T7, T8, T9, E>(values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>, Result<E, T7>, Result<E, T8>, Result<E, T9>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
    function all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, E>(values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>, Result<E, T7>, Result<E, T8>, Result<E, T9>, Result<E, T10>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
    function all<T, E>(values: Result<E, T>[]): Result<Optional<E>[], T[]>;
    function filter<E, T>(list: Result<E, T>[]): T[];
}
