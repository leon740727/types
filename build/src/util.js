"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._Never = exports.wrap = void 0;
/**
 * 將函式 fn 轉換成如果沒有傳回值 (undefined, void)，就傳回原始參數的型式
 */
function wrap(fn) {
    return (value) => {
        const result = fn(value);
        if (result === undefined) {
            return value;
        }
        else {
            return result;
        }
    };
}
exports.wrap = wrap;
class _Never {
    constructor(v = '') {
        this.v = v;
        throw 'never';
    }
}
exports._Never = _Never;
