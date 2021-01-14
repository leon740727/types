"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = void 0;
const result_1 = require("./result");
const util = require("./util");
class Optional {
    constructor(value) {
        this.value = value;
    }
    get present() {
        return this.value !== null && this.value !== undefined;
    }
    static of(value) {
        return new Optional(value);
    }
    static empty() {
        return new Optional(null);
    }
    orNull() {
        return this.value === undefined ? null : this.value;
    }
    orElse(others) {
        const value = this.orNull();
        return value === null ? others : value;
    }
    orExec(fn) {
        // 無論 Optional 是否有值，orElse 裡面的表達式都會被求值
        // 例如: doc.orElse(loadDefault()) 不論 doc 是否有值，loadDefault 都會執行
        // 如果不希望 orElse 裡面的表達式被無謂求值，就用 orExec
        const value = this.orNull();
        return value === null ? fn() : value;
    }
    orFail(error) {
        const value = this.orNull();
        return value === null ? result_1.Result.fail(error) : result_1.Result.ok(value);
    }
    /** get value or throw an error */
    orError(error) {
        const value = this.orNull();
        if (value !== null) {
            return value;
        }
        else {
            throw error;
        }
    }
    map(fn) {
        // 有時 map() 的目的僅是利用其副作用，例如要 console.log，但卻可能不小心改變了其值
        // 為了防止這種意外，轉換函式 fn 如果沒有傳回值 (undefined)，其內容不會被轉換
        const value = this.orNull();
        if (value === null) {
            return Optional.empty();
        }
        else {
            return Optional.of(util.wrap(fn)(value));
        }
    }
    ifPresent(fn) {
        // something.ifPresent 跟 something.map 的作用一樣，但提供比較清楚的語意
        // 讓使用者不用再寫 if (xxx.present) { xxx.orError('xxx') } 的程式碼
        return this.map(fn);
    }
    chain(fn) {
        const value = this.orNull();
        return value === null ? Optional.empty() : fn(value);
    }
    static filter(list) {
        return list.filter(i => i.present).map(i => i.orError('wont happened'));
    }
    static all(values) {
        const results = Optional.filter(values);
        if (results.length === values.length) {
            return Optional.of(results);
        }
        else {
            return Optional.empty();
        }
    }
    static fetchFilter(list, fetch) {
        return zip(list, list.map(fetch).map(prop => prop.orNull()))
            .filter(([item, prop]) => prop !== null)
            .map(([item, prop]) => ({ data: prop, src: item }));
    }
}
exports.Optional = Optional;
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
