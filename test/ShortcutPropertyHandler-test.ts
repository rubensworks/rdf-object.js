import {ShortcutPropertyHandler} from "../lib/ShortcutPropertyHandler";

describe('ShortcutPropertyHandler', () => {
  describe('constructed with an empty JSON-LD context', () => {
    const handler = new ShortcutPropertyHandler({});
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
      expect(object.a).toEqual([]);
    });

    it('proxy should not get a property with an empty array', () => {
      expect(object.none).toEqual([]);
    });

    it('proxy should get a property with an array of size 1', () => {
      expect(object.one).toEqual(['a']);
    });

    it('proxy should get a property with an array of size 2', () => {
      expect(object.two).toEqual(['a', 'b']);
    });

    it('proxy should allow a property to be set', () => {
      (<any> object).three = ['a', 'b', 'c'];
      expect((<any> raw).three).toEqual(['a', 'b', 'c']);
    });

    it('proxy own all keys with values that have an array of size at least 1', () => {
      expect(Object.keys(object)).toEqual(['one', 'two', 'three']);
    });
  });

  describe('constructed with a non-empty JSON-LD context', () => {
    const handler = new ShortcutPropertyHandler({
      ex: 'http://example.org/',
    });
    const raw: any = {
      'http://example.org/none': [],
      'http://example.org/one': ['a'],
      'http://example.org/two': ['a', 'b'],
    };
    const object = new Proxy(raw, handler);

    it('should be usable as a proxy handler', () => {
      return expect(object).toBeTruthy();
    });

    it('proxy should not have a non-existing property', () => {
      expect('ex:a' in object).toBeFalsy();
    });

    it('proxy should not have a property with an empty array', () => {
      expect('ex:none' in object).toBeFalsy();
    });

    it('proxy should have a property with an array of size 1', () => {
      expect('ex:one' in object).toBeTruthy();
    });

    it('proxy should have a property with an array of size 2', () => {
      expect('ex:two' in object).toBeTruthy();
    });

    it('proxy should not get a non-existing property', () => {
      expect(object['ex:a']).toEqual([]);
    });

    it('proxy should not get a property with an empty array', () => {
      expect(object['ex:none']).toEqual([]);
    });

    it('proxy should get a property with an array of size 1', () => {
      expect(object['ex:one']).toEqual(['a']);
    });

    it('proxy should get a property with an array of size 2', () => {
      expect(object['ex:two']).toEqual(['a', 'b']);
    });

    it('proxy own all keys with values that have an array of size at least 1', () => {
      expect(Object.keys(object)).toEqual(['http://example.org/one', 'http://example.org/two']);
    });
  });
});
