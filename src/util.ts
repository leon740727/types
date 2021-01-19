/**
 * 將函式 fn 轉換成如果沒有傳回值 (undefined, void)，就傳回原始參數的型式
 */
export function wrap <T, T2> (fn: (value: T) => T2) {
    return (value: T) => {
        const result = fn(value);
        if (result === undefined) {
            return value;
        } else {
            return result;
        }
    };
}

export class _Never {
    constructor (private v = '') { throw 'never' }
}
