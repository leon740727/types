function _assert(state: boolean, msg: string) {
    if (!state) {
        throw msg;
    }
}

export type Jsonable = {[field: string]: any} | any [];

export class Optional<T> {
    private value: T;
    constructor(value: T) {
        this.value = value;
    }

    static of<U>(v: U) {
        _assert(v != null, "NULL ERROR!!");
        return new Optional<U>(v);
    }
    static empty() {
        return new Optional(null);
    }
    static of_nullable<U>(v: U): Optional<U> {
        /** 可傳入 v:U 或 null 或 undefined */
        // null 跟 undefined 會自動互轉
        return v == null ? Optional.empty() : Optional.of(v);
    }
    is_present() {
        return this.value != null;
    }
    get(): T {
        _assert(this.value != null, "NULL ERROR!!");
        return this.value;
    }
    or_else(others): T {
        return this.is_present() ? this.value : others;
    }
    map<R>(f: (a: T) => R): Optional<R> {
        return this.is_present() ? Optional.of(f(this.value)) : Optional.empty();
    }
    chain<R>(f: (a: T) => Optional<R>): Optional<R> {
        return this.is_present() ? f(this.value) : Optional.empty();
    }
}

export class Result<E, T> {
    ok: boolean;
    private value: T;
    private error: E;
    constructor(ok: boolean, error: E, value: T) {
        this.ok = ok;
        this.value = value;
        this.error = error;
    }
    static ok<E,T>(v: T) {
        return new Result(true, null, v);
    }
    static fail<E,T>(e: E) {
        return new Result(false, e, null);
    }
    map<R>(f:(v:T)=>R): Result<E,R> {
        if (this.ok) {
            return Result.ok(f(this.value));
        } else {
            return Result.fail(this.error);
        }
    }
    chain<R>(f:(v:T)=>Result<E,R>): Result<E,R> {
        if (this.ok) {
            return f(this.value);
        } else {
            return Result.fail(this.error);
        }
    }
    get() {
        _assert(this.ok, "Result 不 ok");
        return this.value;
    }
    get_error() {
        _assert(!this.ok, "Result 不 fail");
        return this.error;
    }
    either<R>(f:(e:E)=>R, g:(v:T)=>R): R {
        if (this.ok) {
            return g(this.value);
        } else {
            return f(this.error);
        }
    }
}

export class List<T> extends Array<T> {
    static of<T>(set: Set<T>): List<T>;
    static of<T>(data: T[]): List<T>;
    static of<T>(data): List<T> {
        let res = new List<T>();
        if (data instanceof Array) {
            data.forEach(i => res.push(i));
        } else if (data instanceof Set) {
            Array.from((<Set<T>>data).values()).forEach(i => res.push(i));
        } else {
            throw 'List.of 只接受 Array, Set 類型的參數';
        }
        return res;
    }
    chain<R>(f: (i: T) => R[]) {
        function flatten<T>(listOfList: T[][]) {
            let res: T[] = [];
            listOfList.forEach(list => list.forEach(i => res.push(i)));
            return res;
        }
        return List.of(flatten(this.map(f)));
    }
}

export class IO<T> {
    exec: () => T;
    constructor(data: ()=>T) {
        this.exec = data;
    }
    static of<T>(res: T) {
        return new IO(() => res);
    }

    map<R>(f: (p:T) => R) {
        return new IO(() => f(this.exec()));
    }

    chain<R>(f: (p:T) => IO<R>) {
        let o = new IO(() => f(this.exec()));
        return o.exec();
    }
}
