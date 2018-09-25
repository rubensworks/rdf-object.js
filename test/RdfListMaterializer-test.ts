import {literal, namedNode} from "@rdfjs/data-model";
import {RdfListMaterializer} from "../lib/RdfListMaterializer";

// tslint:disable:no-var-requires
const streamifyArray = require('streamify-array');
const quad = require('rdf-quad');

describe('RdfListMaterializer', () => {
  describe('an instance', () => {

    let materializer: RdfListMaterializer;

    beforeEach(() => {
      materializer = new RdfListMaterializer();
    });

    it('should not have any lists for empty streams', async () => {
      await materializer.import(streamifyArray([]));
      expect(materializer.getRoots()).toEqual([]);
      expect(materializer.getList(namedNode('http://example.org/l0'))).toBeFalsy();
    });

    it('should parse a valid list', async () => {
      await materializer.import(streamifyArray([
        quad('http://example.org/listResource', 'http://example.org/listPredicate', 'http://example.org/l0'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"A"'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l1'),
        quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"B"'),
        quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l2'),
        quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"C"'),
        quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
      ]));
      expect(materializer.getRoots()).toEqual([
        namedNode('http://example.org/l0'),
        namedNode('http://example.org/l1'),
        namedNode('http://example.org/l2'),
      ]);
      expect(materializer.getList(namedNode('http://example.org/l0'))).toEqual([
        literal('A'), literal('B'), literal('C'),
      ]);
      expect(materializer.getList(namedNode('http://example.org/l1'))).toEqual([
        literal('B'), literal('C'),
      ]);
      expect(materializer.getList(namedNode('http://example.org/l2'))).toEqual([
        literal('C'),
      ]);
    });

    it('should parse a valid out-of-order list', async () => {
      await materializer.import(streamifyArray([
        quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
        quad('http://example.org/listResource', 'http://example.org/listPredicate', 'http://example.org/l0'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l1'),
        quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"B"'),
        quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l2'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"A"'),
        quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"C"'),
      ]));
      expect(materializer.getRoots()).toEqual([
        namedNode('http://example.org/l2'),
        namedNode('http://example.org/l0'),
        namedNode('http://example.org/l1'),
      ]);
      expect(materializer.getList(namedNode('http://example.org/l0'))).toEqual([
        literal('A'), literal('B'), literal('C'),
      ]);
      expect(materializer.getList(namedNode('http://example.org/l1'))).toEqual([
        literal('B'), literal('C'),
      ]);
      expect(materializer.getList(namedNode('http://example.org/l2'))).toEqual([
        literal('C'),
      ]);
    });

    it('should not parse an incomplete list', async () => {
      await materializer.import(streamifyArray([
        quad('http://example.org/listResource', 'http://example.org/listPredicate', 'http://example.org/l0'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"A"'),
      ]));
      expect(materializer.getRoots()).toEqual([]);
      expect(materializer.getList(namedNode('http://example.org/l0'))).toBeFalsy();
    });

  });
});
