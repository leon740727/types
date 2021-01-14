import { Optional } from './index';
import * as util from './util';

export interface Result <E, T> {
    readonly ok: boolean;
    readonly fail: boolean;

    readonly value: Optional<T>;
    readonly error: Optional<E>;

    map (fn: (value: T) => undefined | void): Result<E, T>;
    map <T2> (fn: (value: T) => T2): Result <E, T2>;

    chain <E2, T2> (fn: (value: T) => Result<E2, T2>): Result<E|E2, T2>;

    /** alias of map() */
    ifOk (fn: (value: T) => undefined | void): Result<E, T>;
    ifOk <T2> (fn: (value: T) => T2): Result <E, T2>;

    ifFail (fn: (error: E) => undefined | void): Result<E, T>;
    ifFail <E2> (fn: (error: E) => E2): Result<E2, T>;

    either <R> (errorHandler: (error: E) => R, valueHandler: (value: T) => R): R;

    orElse (others: T): T;

    /** get value or throw error */
    orError (): T;
}

export namespace Result {
    export function ok <E, T> (value: T): Result<E, T> {
        return new Ok(value);
    }

    export function fail <E, T> (error: E): Result<E, T> {
        return new Fail(error);
    }

    export function isa (object) {
        return object instanceof Ok || object instanceof Fail;
    }

    export function all <T1, T2, E> (values: [Result<E, T1>, Result<E, T2>]): Result<Optional<E>[], [T1, T2]>;
    export function all <T1, T2, T3, E> (values: [Result<E, T1>, Result<E, T2>, Result<E, T3>]): Result<Optional<E>[], [T1, T2, T3]>;
    export function all <T1, T2, T3, T4, E> (values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>]): Result<Optional<E>[], [T1, T2, T3, T4]>;
    export function all <T1, T2, T3, T4, T5, E> (values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>]): Result<Optional<E>[], [T1, T2, T3, T4, T5]>;
    export function all <T1, T2, T3, T4, T5, T6, E> (values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6]>;
    export function all <T1, T2, T3, T4, T5, T6, T7, E> (values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>, Result<E, T7>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6, T7]>;
    export function all <T1, T2, T3, T4, T5, T6, T7, T8, E> (values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>, Result<E, T7>, Result<E, T8>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6, T7, T8]>;
    export function all <T1, T2, T3, T4, T5, T6, T7, T8, T9, E> (values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>, Result<E, T7>, Result<E, T8>, Result<E, T9>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
    export function all <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, E> (values: [Result<E, T1>, Result<E, T2>, Result<E, T3>, Result<E, T4>, Result<E, T5>, Result<E, T6>, Result<E, T7>, Result<E, T8>, Result<E, T9>, Result<E, T10>]): Result<Optional<E>[], [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
    export function all <T, E> (values: Result<E, T>[]): Result<Optional<E>[], T[]>;
    export function all <E> (values: Result<E, any>[]) {
        const results = filter(values);
        if (results.length === values.length) {
            return ok(results);
        } else {
            return fail(values.map(v => v.error));
        }
    }

    export function filter <E, T> (list: Result<E, T>[]): T[] {
        return list.filter(i => i.ok).map(i => i.orError());
    }
}

class Ok <E, T> implements Result <E, T> {
    constructor (private _value: T) {}

    get ok () {
        return true;
    }

    get fail () {
        return false;
    }

    get value () {
        return Optional.of(this._value);
    }

    get error () {
        return Optional.empty<E>();
    }

    map <T2> (fn: (value: T) => T2) {
        return new Ok<E, T | T2>(util.wrap(fn)(this._value));
    }

    chain <E2, T2> (fn: (value: T) => Result<E2, T2>): Result<E|E2, T2> {
        return fn(this._value);
    }

    ifOk <T2> (fn: (value: T) => T2) {
        return this.map(fn);
    }

    ifFail <E2> (fn: (error: E) => E2): Result<E2, T> {
        return new Ok(this._value);
    }

    either <R> (errorHandler: (error: E) => R, valueHandler: (value: T) => R): R {
        return valueHandler(this._value);
    }

    orElse (others: T): T {
        return this._value;
    }

    orError (): T {
        return this._value;
    }
}

class Fail <E, T> implements Result<E, T> {
    constructor (private _error: E) {
        if (this._error === null) {
            throw new Error('error value in Result.fail(error) could not be null');
        }
    }

    get ok () {
        return false;
    }

    get fail () {
        return true;
    }

    get value () {
        return Optional.empty<T>();
    }

    get error () {
        return Optional.of(this._error);
    }

    map <T2> (fn: (value: T) => T2): Result <E, T2> {
        return new Fail(this._error);
    }

    chain <E2, T2> (fn: (value: T) => Result<E2, T2>): Result<E|E2, T2> {
        return new Fail(this._error);
    }

    ifOk <T2> (fn: (value: T) => T2): Result <E, T2> {
        return this.map(fn);
    }

    ifFail <E2> (fn: (error: E) => E2) {
        const e2 = util.wrap(fn)(this._error);
        if (e2 === null) {
            // newError 不能是 null，因為這會改變 Result 的狀態，但卻沒有明確指定一個 right value 給 right Result
            throw new Error('function argument in Result.ifFail() could not return null');
        }
        return new Fail<E|E2, T>(e2);
    }

    either <R> (errorHandler: (error: E) => R, valueHandler: (value: T) => R): R {
        return errorHandler(this._error);
    }

    orElse (others: T): T {
        return others;
    }

    orError (): T {
        throw this._error;
    }
}
