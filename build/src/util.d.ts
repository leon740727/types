/**
 * 將函式 fn 轉換成如果沒有傳回值 (undefined, void)，就傳回原始參數的型式
 */
export declare function wrap<T, T2>(fn: (value: T) => T2): (value: T) => T | T2;
