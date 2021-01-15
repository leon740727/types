import { Result } from './result';
export declare class Optional<T> {
    private value;
    constructor(value: T | null | undefined);
    get present(): boolean;
    static of<T>(value: T | null | undefined): Optional<T>;
    static empty<T>(): Optional<T>;
    orNull(): T | null;
    orElse(others: T): T;
    orExec(fn: () => T): T;
    orFail<E>(error: E): Result<E, T>;
    /** get value or throw an error */
    orError<E>(error: E): T;
    map(fn: (value: T) => null | undefined | void | T): Optional<T>;
    map<T2>(fn: (value: T) => T2): Optional<T2>;
    /** alias of Optional.map() */
    ifPresent(fn: (value: T) => null | undefined | void | T): Optional<T>;
    ifPresent<T2>(fn: (value: T) => T2): Optional<T2>;
    chain<T2>(fn: (value: T) => Optional<T2>): Optional<T2>;
    static filter<T>(list: Optional<T>[]): T[];
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
    static fetchFilter<T, P>(list: T[], fetch: (item: T) => Optional<P>): {
        data: P;
        src: T;
    }[];
}
