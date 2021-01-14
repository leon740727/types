"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = void 0;
/**
 * 將函式 fn 轉換成如果沒有傳回值，就傳回原始參數的型式
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
