import { DataFactory } from 'rdf-data-factory';
import type * as RDF from 'rdf-js';
import { RdfObjectLoader } from '../lib/RdfObjectLoader';
import { Resource } from '../lib/Resource';
import 'jest-rdf';

const quad = require('rdf-quad');
const streamifyArray = require('streamify-array');
const DF = new DataFactory<RDF.BaseQuad>();

describe('RdfObjectLoader', () => {
  describe('an instance without context', () => {
    let loader: RdfObjectLoader;

    beforeEach(() => {
      loader = new RdfObjectLoader();
    });

    describe('import', () => {
      it('should import an empty stream', async() => {
        await loader.import(streamifyArray([]));
        expect(loader.resources).toEqual({});
      });

      it('should import with one quad', async() => {
        await loader.import(streamifyArray([
          quad('http://example.org/s', 'http://example.org/p', 'http://example.org/o'),
        ]));
        const resourceO = loader.getOrMakeResource(DF.namedNode('http://example.org/o'));
        const resourceP = loader.getOrMakeResource(DF.namedNode('http://example.org/p'));
        const resourceS = loader.getOrMakeResource(DF.namedNode('http://example.org/s'));
        resourceS.addProperty(resourceP, resourceO);
        expect(loader.resources).toEqual({
          'http://example.org/o': resourceO,
          'http://example.org/p': resourceP,
          'http://example.org/s': resourceS,
        });
      });

      it('should import with one generalized quad', async() => {
        await loader.import(<RDF.Stream<RDF.BaseQuad>> streamifyArray([
          DF.quad(
            DF.blankNode('http://example.org/s'),
            DF.blankNode('http://example.org/p'),
            DF.blankNode('http://example.org/o'),
          ),
        ]));
        const resourceO = loader.getOrMakeResource(DF.blankNode('http://example.org/o'));
        const resourceP = loader.getOrMakeResource(DF.blankNode('http://example.org/p'));
        const resourceS = loader.getOrMakeResource(DF.blankNode('http://example.org/s'));
        resourceS.addProperty(resourceP, resourceO);
        expect(loader.resources).toEqual({
          '_:http://example.org/o': resourceO,
          '_:http://example.org/p': resourceP,
          '_:http://example.org/s': resourceS,
        });
      });

      it('should import with two linked quads', async() => {
        await loader.import(streamifyArray([
          quad('http://example.org/a', 'http://example.org/p1', 'http://example.org/b'),
          quad('http://example.org/b', 'http://example.org/p2', 'http://example.org/c'),
        ]));
        const resourceA = loader.getOrMakeResource(DF.namedNode('http://example.org/a'));
        const resourceB = loader.getOrMakeResource(DF.namedNode('http://example.org/b'));
        const resourceC = loader.getOrMakeResource(DF.namedNode('http://example.org/c'));
        const resourceP1 = loader.getOrMakeResource(DF.namedNode('http://example.org/p1'));
        const resourceP2 = loader.getOrMakeResource(DF.namedNode('http://example.org/p2'));
        resourceA.addProperty(resourceP1, resourceB);
        resourceB.addProperty(resourceP2, resourceC);
        expect(loader.resources).toEqual({
          'http://example.org/a': resourceA,
          'http://example.org/b': resourceB,
          'http://example.org/c': resourceC,
          'http://example.org/p1': resourceP1,
          'http://example.org/p2': resourceP2,
        });
      });

      it('should normalize a list', async() => {
        await loader.import(streamifyArray([
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
        const valueA = loader.getOrMakeResource(DF.literal('A'));
        const valueB = loader.getOrMakeResource(DF.literal('B'));
        const valueC = loader.getOrMakeResource(DF.literal('C'));
        expect(loader.resources['http://example.org/listResource'].propertiesUri['http://example.org/listPredicate'][0]
          .list).toEqual([ valueA, valueB, valueC ]);
      });
    });
  });

  describe('an instance without context and without list normalization', () => {
    let loader: RdfObjectLoader;

    beforeEach(() => {
      loader = new RdfObjectLoader({ normalizeLists: false });
    });

    describe('import', () => {
      it('should import an empty stream', async() => {
        await loader.import(streamifyArray([]));
        expect(loader.resources).toEqual({});
      });

      it('should import with one quad', async() => {
        await loader.import(streamifyArray([
          quad('http://example.org/s', 'http://example.org/p', 'http://example.org/o'),
        ]));
        const resourceO = loader.getOrMakeResource(DF.namedNode('http://example.org/o'));
        const resourceP = loader.getOrMakeResource(DF.namedNode('http://example.org/p'));
        const resourceS = loader.getOrMakeResource(DF.namedNode('http://example.org/s'));
        resourceS.addProperty(resourceP, resourceO);
        expect(loader.resources).toEqual({
          'http://example.org/o': resourceO,
          'http://example.org/p': resourceP,
          'http://example.org/s': resourceS,
        });
      });

      it('should import with two linked quads', async() => {
        await loader.import(streamifyArray([
          quad('http://example.org/a', 'http://example.org/p1', 'http://example.org/b'),
          quad('http://example.org/b', 'http://example.org/p2', 'http://example.org/c'),
        ]));
        const resourceA = loader.getOrMakeResource(DF.namedNode('http://example.org/a'));
        const resourceB = loader.getOrMakeResource(DF.namedNode('http://example.org/b'));
        const resourceC = loader.getOrMakeResource(DF.namedNode('http://example.org/c'));
        const resourceP1 = loader.getOrMakeResource(DF.namedNode('http://example.org/p1'));
        const resourceP2 = loader.getOrMakeResource(DF.namedNode('http://example.org/p2'));
        resourceA.addProperty(resourceP1, resourceB);
        resourceB.addProperty(resourceP2, resourceC);
        expect(loader.resources).toEqual({
          'http://example.org/a': resourceA,
          'http://example.org/b': resourceB,
          'http://example.org/c': resourceC,
          'http://example.org/p1': resourceP1,
          'http://example.org/p2': resourceP2,
        });
      });

      it('should not normalize a list', async() => {
        await loader.import(streamifyArray([
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
        expect(loader.resources['http://example.org/listResource'].propertiesUri['http://example.org/listPredicate'][0]
          .list).toBeFalsy();
      });
    });
  });

  describe('an instance with context', () => {
    let context;
    let loader: RdfObjectLoader;

    beforeEach(() => {
      context = {
        myP: 'http://example.org/p',
        myP1: 'http://example.org/p1',
        myP2: 'http://example.org/p2',
      };
      loader = new RdfObjectLoader({ context });
    });

    describe('import', () => {
      it('should import an empty stream in an array', async() => {
        await loader.importArray([]);
        expect(loader.resources).toEqual({});
      });

      it('should import with one quad in an array', async() => {
        await loader.importArray([
          quad('http://example.org/s', 'http://example.org/p', 'http://example.org/o'),
        ]);
        const resourceO = loader.getOrMakeResource(DF.namedNode('http://example.org/o'));
        const resourceP = loader.getOrMakeResource(DF.namedNode('http://example.org/p'));
        const resourceS = loader.getOrMakeResource(DF.namedNode('http://example.org/s'));
        resourceS.addProperty(resourceP, resourceO);
        resourceS.addProperty(new Resource({ term: DF.namedNode('myP') }), resourceO);
        expect(loader.resources).toEqual({
          'http://example.org/o': resourceO,
          'http://example.org/p': resourceP,
          'http://example.org/s': resourceS,
        });
      });

      it('should import with two linked quads in an array', async() => {
        await loader.importArray([
          quad('http://example.org/a', 'http://example.org/p1', 'http://example.org/b'),
          quad('http://example.org/b', 'http://example.org/p2', 'http://example.org/c'),
        ]);
        const resourceA = loader.getOrMakeResource(DF.namedNode('http://example.org/a'));
        const resourceB = loader.getOrMakeResource(DF.namedNode('http://example.org/b'));
        const resourceC = loader.getOrMakeResource(DF.namedNode('http://example.org/c'));
        const resourceP1 = loader.getOrMakeResource(DF.namedNode('http://example.org/p1'));
        const resourceP2 = loader.getOrMakeResource(DF.namedNode('http://example.org/p2'));
        resourceA.addProperty(resourceP1, resourceB);
        resourceA.addProperty(new Resource({ term: DF.namedNode('myP1') }), resourceB);
        resourceB.addProperty(resourceP2, resourceC);
        resourceB.addProperty(new Resource({ term: DF.namedNode('myP2') }), resourceC);
        expect(loader.resources).toEqual({
          'http://example.org/a': resourceA,
          'http://example.org/b': resourceB,
          'http://example.org/c': resourceC,
          'http://example.org/p1': resourceP1,
          'http://example.org/p2': resourceP2,
        });
      });
    });

    describe('createCompactedResource', () => {
      it('should handle string values', async() => {
        expect(loader.createCompactedResource('"abc"').term).toEqualRdfTerm(DF.literal('abc'));
      });

      it('should handle resource values', async() => {
        const resource = new Resource({ term: DF.blankNode() });
        expect(loader.createCompactedResource(resource)).toBe(resource);
      });

      it('should handle an empty hash', async() => {
        expect(loader.createCompactedResource({}).term).toEqualRdfTerm(DF.blankNode());
      });

      it('should handle a hash with @id', async() => {
        expect(loader.createCompactedResource({
          '@id': 'http://example.org/id',
        }).term).toEqualRdfTerm(DF.namedNode('http://example.org/id'));
      });

      it('should handle a hash with list', async() => {
        const resource = loader.createCompactedResource({
          list: [
            '"a"',
            '"b"',
          ],
        });
        expect(resource.list).toBeTruthy();
        expect(resource.list?.length).toBe(2);
        expect(resource.list![0].term).toEqualRdfTerm(DF.literal('a'));
        expect(resource.list![1].term).toEqualRdfTerm(DF.literal('b'));
      });

      it('should handle a hash with singular list', async() => {
        const resource = loader.createCompactedResource({
          list: '"a"',
        });
        expect(resource.list).toBeTruthy();
        expect(resource.list?.length).toBe(1);
        expect(resource.list![0].term).toEqualRdfTerm(DF.literal('a'));
      });

      it('should handle a hash with a property array', async() => {
        const resource = loader.createCompactedResource({
          prop: [ '"a"', '"b"' ],
        });
        expect(resource.property.prop.term).toEqualRdfTerm(DF.literal('a'));
        expect(resource.properties.prop[0].term).toEqualRdfTerm(DF.literal('a'));
        expect(resource.properties.prop[1].term).toEqualRdfTerm(DF.literal('b'));
      });

      it('should handle a hash with a singular property', async() => {
        const resource = loader.createCompactedResource({
          prop: '"a"',
        });
        expect(resource.property.prop.term).toEqualRdfTerm(DF.literal('a'));
      });
    });
  });

  describe('an instance with erroring context', () => {
    let context: any;
    let loader: RdfObjectLoader;

    beforeEach(() => {
      context = 123;
      loader = new RdfObjectLoader({ context });
    });

    describe('import', () => {
      it('should fail on first call', async() => {
        await expect(loader.importArray([])).rejects
          .toThrow(new Error('Tried parsing a context that is not a string, array or object, but got 123'));
      });
    });
  });
});
