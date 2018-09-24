import {SingularPropertyHandler} from "../lib/SingularPropertyHandler";

describe('SingularPropertyHandler', () => {
  describe('constructed', () => {
    const handler = new SingularPropertyHandler();
    const raw: any = {
      none: [],
      one: ['a'],
      two: ['a', 'b'],
    };
    const object = new Proxy(raw, handler);

    it('should be usable as a proxy handler', () => {
      return expect(object).toBeTruthy();
    });

    it('proxy should not have a non-existing property', () => {
      expect('a' in object).toBeFalsy();
    });

    it('proxy should not have a property with an empty array', () => {
      expect('none' in object).toBeFalsy();
    });

    it('proxy should have a property with an array of size 1', () => {
      expect('one' in object).toBeTruthy();
    });

    it('proxy should have a property with an array of size 2', () => {
      expect('two' in object).toBeTruthy();
    });

    it('proxy should not get a non-existing property', () => {
      expect(object.a).toBeFalsy();
    });

    it('proxy should not get a property with an empty array', () => {
      expect(object.none).toBeFalsy();
    });

    it('proxy should get a property with an array of size 1', () => {
      expect(object.one).toEqual('a');
    });

    it('proxy should get a property with an array of size 2', () => {
      expect(object.two).toEqual('a');
    });

    it('proxy should allow a property to be set', () => {
      (<any> object).three = 'b';
      expect((<any> raw).three).toEqual(['b']);
    });

    it('proxy own all keys with values that have an array of size at least 1', () => {
      expect(Object.keys(object)).toEqual(['one', 'two', 'three']);
    });
  });
});
