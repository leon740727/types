import * as assert from 'assert';
import { Optional, Result } from '../src/index';

declare const describe, it, before, after, afterEach;

type Animal = { age: number };
type Mankind = { age: number, name: string };

const a: Animal = { age: 5 };
const m: Mankind = { age: 5, name: 'leon' };

function sideEffect () {
    // console.log(n);
}

/**
 * 這些測試必須在 strictNullChecks = false 的環境下測試
 * 主要是確保 functor map 函式的傳回值型別是正確的
 */
describe('functor type (optional)', () => {
    const o = Optional.of(a);

    it('map', () => {
        const o1: Optional<number> = o.map(_ => 1);
        const o2: Optional<any> = o.map(_ => null);
        const o3: Optional<any> = o.map(_ => undefined);
        const o4: Optional<Animal> = o.map(_ => sideEffect());
        const o5: Optional<Animal> = o.map(_ => ({ age: 6 }));
        assert.deepStrictEqual(o5.orNull(), { age: 6 });
        const o6: Optional<Mankind> = o.map(_ => m);
        assert.deepStrictEqual(o6.orNull(), m);
    });

    it('ifPresent', () => {
        const o4: Optional<Animal> = o.ifPresent(_ => sideEffect());
        const o5: Optional<Animal> = o.ifPresent(_ => ({ age: 6 }));
        assert.deepStrictEqual(o5.orNull(), { age: 6 });
        const o6: Optional<Mankind> = o.ifPresent(_ => m);
        assert.deepStrictEqual(o6.orNull(), m);
    });
});

describe('functor type (result)', () => {
    const o = Result.ok<string, Animal>(a);

    it('map', () => {
        const o1: Result<string, number> = o.map(_ => 1);
        const o2: Result<string, any> = o.map(_ => null);
        const o3: Result<string, any> = o.map(_ => undefined);
        const o4: Result<string, Animal> = o.map(_ => sideEffect());
        const o5: Result<string, Animal> = o.map(_ => ({ age: 6 }));
        assert.deepStrictEqual(o5.orError(), { age: 6 });
        const o6: Result<string, Mankind> = o.map(_ => m);
        assert.deepStrictEqual(o6.orError(), m);
    });

    it('ifOk', () => {
        const o4: Result<string, Animal> = o.ifOk(_ => sideEffect());
        const o5: Result<string, Animal> = o.ifOk(_ => ({ age: 6 }));
        assert.deepStrictEqual(o5.orError(), { age: 6 });
        const o6: Result<string, Mankind> = o.ifOk(_ => m);
        assert.deepStrictEqual(o6.orError(), m);
    });

    it('ifFail', () => {
        const o = Result.fail<Animal, number>(a);
        const o1: Result<number, number> = o.ifFail(_ => 5);
        assert.deepStrictEqual(o1.error.orNull(), 5);
        const o2: Result<Animal, number> = o.ifFail(_ => undefined);
        assert.deepStrictEqual(o2.error.orNull(), a);
        const o3: Result<Animal, number> = o.ifFail(_ => sideEffect());
        assert.deepStrictEqual(o3.error.orNull(), a);
        const o4: Result<Animal, number> = o.ifFail(_ => ({ age: 6 }));
        assert.deepStrictEqual(o4.error.orNull(), { age: 6 });
        const o5: Result<Mankind, number> = o.ifFail(_ => m);
        assert.deepStrictEqual(o5.error.orNull(), m);
    });
});
