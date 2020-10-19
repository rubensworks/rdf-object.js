import { DataFactory } from 'rdf-data-factory';
import { RdfListMaterializer } from '../lib/RdfListMaterializer';

const quad = require('rdf-quad');
const streamifyArray = require('streamify-array');
const DF = new DataFactory();

describe('RdfListMaterializer', () => {
  describe('an instance', () => {
    let materializer: RdfListMaterializer;

    beforeEach(() => {
      materializer = new RdfListMaterializer();
    });

    it('should not have any lists for empty streams', async() => {
      await materializer.import(streamifyArray([]));
      expect(materializer.getRoots()).toEqual([]);
      expect(materializer.getList(DF.namedNode('http://example.org/l0'))).toBeFalsy();
    });

    it('should parse a valid list', async() => {
      await materializer.import(streamifyArray([
        quad('http://example.org/listResource', 'http://example.org/listPredicate', 'http://example.org/l0'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"A"'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l1'),
        quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"B"'),
        quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l2'),
        quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"C"'),
        quad('http://example.org/l2',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
      ]));
      expect(materializer.getRoots()).toEqual([
        DF.namedNode('http://example.org/l0'),
        DF.namedNode('http://example.org/l1'),
        DF.namedNode('http://example.org/l2'),
      ]);
      expect(materializer.getList(DF.namedNode('http://example.org/l0'))).toEqual([
        DF.literal('A'), DF.literal('B'), DF.literal('C'),
      ]);
      expect(materializer.getList(DF.namedNode('http://example.org/l1'))).toEqual([
        DF.literal('B'), DF.literal('C'),
      ]);
      expect(materializer.getList(DF.namedNode('http://example.org/l2'))).toEqual([
        DF.literal('C'),
      ]);
    });

    it('should parse a valid out-of-order list', async() => {
      await materializer.import(streamifyArray([
        quad('http://example.org/l2',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
        quad('http://example.org/listResource', 'http://example.org/listPredicate', 'http://example.org/l0'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l1'),
        quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"B"'),
        quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l2'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"A"'),
        quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"C"'),
      ]));
      expect(materializer.getRoots()).toEqual([
        DF.namedNode('http://example.org/l2'),
        DF.namedNode('http://example.org/l0'),
        DF.namedNode('http://example.org/l1'),
      ]);
      expect(materializer.getList(DF.namedNode('http://example.org/l0'))).toEqual([
        DF.literal('A'), DF.literal('B'), DF.literal('C'),
      ]);
      expect(materializer.getList(DF.namedNode('http://example.org/l1'))).toEqual([
        DF.literal('B'), DF.literal('C'),
      ]);
      expect(materializer.getList(DF.namedNode('http://example.org/l2'))).toEqual([
        DF.literal('C'),
      ]);
    });

    it('should not parse an incomplete list', async() => {
      await materializer.import(streamifyArray([
        quad('http://example.org/listResource', 'http://example.org/listPredicate', 'http://example.org/l0'),
        quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"A"'),
      ]));
      expect(materializer.getRoots()).toEqual([]);
      expect(materializer.getList(DF.namedNode('http://example.org/l0'))).toBeFalsy();
    });
  });
});
