import { Result } from './result';
import * as util from './util';

export class Optional<T> {

    constructor (private value: T | null | undefined) {}

    get present () {
        return this.value !== null && this.value !== undefined;
    }

    static of <T> (value: T | null | undefined): Optional<T> {
        return new Optional<T>(value);
    }

    static empty <T> (): Optional<T> {
        return new Optional<T>(null);
    }

    orNull (): T | null {
        return this.value === undefined ? null : this.value;
    }

    orElse (others: T): T {
        const value = this.orNull();
        return value === null ? others : value;
    }

    orExec (fn: () => T): T {
        // 無論 Optional 是否有值，orElse 裡面的表達式都會被求值
        // 例如: doc.orElse(loadDefault()) 不論 doc 是否有值，loadDefault 都會執行
        // 如果不希望 orElse 裡面的表達式被無謂求值，就用 orExec
        const value = this.orNull();
        return value === null ? fn() : value;
    }

    orFail <E> (error: E): Result<E, T> {
        const value = this.orNull();
        return value === null ? Result.fail(error) : Result.ok(value);
    }

    /** get value or throw an error */
    orError <E> (error: E): T {
        const value = this.orNull();
        if (value !== null) {
            return value;
        } else {
            throw error;
        }
    }

    map (fn: (value: T) => null | undefined | void | util._Never): Optional<T>;
    map <T2> (fn: (value: T) => T2): Optional<T2>;
    map <T2> (fn: (value: T) => T2) {
        // 有時 map() 的目的僅是利用其副作用，例如要 console.log，但卻可能不小心改變了其值
        // 為了防止這種意外，轉換函式 fn 如果沒有傳回值 (undefined)，其內容不會被轉換
        const value = this.orNull();
        if (value === null) {
            return Optional.empty<T2>();
        } else {
            return Optional.of(util.wrap(fn)(value));
        }
    }

    /** alias of Optional.map() */
    ifPresent (fn: (value: T) => null | undefined | void | util._Never): Optional<T>;
    ifPresent <T2> (fn: (value: T) => T2): Optional<T2>;
    ifPresent <T2> (fn: (value: T) => T2) {
        // something.ifPresent 跟 something.map 的作用一樣，但提供比較清楚的語意
        // 讓使用者不用再寫 if (xxx.present) { xxx.orError('xxx') } 的程式碼
        return this.map(fn);
    }
    
    chain <T2> (fn: (value: T) => Optional<T2>): Optional<T2> {
        const value = this.orNull();
        return value === null ? Optional.empty() : fn(value);
    }

    static filter <T> (list: Optional<T>[]): T[] {
        return list.filter(i => i.present).map(i => i.orError('wont happened'));
    }

    static all <T1, T2> (values: [Optional<T1>, Optional<T2>]): Optional<[T1, T2]>;
    static all <T1, T2, T3> (values: [Optional<T1>, Optional<T2>, Optional<T3>]): Optional<[T1, T2, T3]>;
    static all <T1, T2, T3, T4> (values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>]): Optional<[T1, T2, T3, T4]>;
    static all <T1, T2, T3, T4, T5> (values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>]): Optional<[T1, T2, T3, T4, T5]>;
    static all <T1, T2, T3, T4, T5, T6> (values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>]): Optional<[T1, T2, T3, T4, T5, T6]>;
    static all <T1, T2, T3, T4, T5, T6, T7> (values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>, Optional<T7>]): Optional<[T1, T2, T3, T4, T5, T6, T7]>;
    static all <T1, T2, T3, T4, T5, T6, T7, T8> (values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>, Optional<T7>, Optional<T8>]): Optional<[T1, T2, T3, T4, T5, T6, T7, T8]>;
    static all <T1, T2, T3, T4, T5, T6, T7, T8, T9> (values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>, Optional<T7>, Optional<T8>, Optional<T9>]): Optional<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
    static all <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10> (values: [Optional<T1>, Optional<T2>, Optional<T3>, Optional<T4>, Optional<T5>, Optional<T6>, Optional<T7>, Optional<T8>, Optional<T9>, Optional<T10>]): Optional<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
    static all <T> (values: Optional<T>[]): Optional<T[]>;
    static all (values: Optional<any>[]) {
        const results = Optional.filter(values);
        if (results.length === values.length) {
            return Optional.of(results);
        } else {
            return Optional.empty();
        }
    }

    static fetchFilter <T, P> (
        list: T[],
        fetch: (item: T) => Optional<P>,
    ): {data: P, src: T}[] {
        return zip(
            list,
            list.map(fetch).map(prop => prop.orNull()))
        .filter(([item, prop]) => prop !== null)
        .map(([item, prop]) => ({data: prop as P, src: item}));
    }
}

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
