import { Readable } from 'stream';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
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

      it('should normalize an empty list', async() => {
        await loader.import(streamifyArray([
          quad('http://example.org/listResource',
            'http://example.org/listPredicate',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
        ]));
        expect(loader.resources['http://example.org/listResource'].propertiesUri['http://example.org/listPredicate'][0]
          .list).toEqual([]);
      });

      it('should reject on an erroring stream', async() => {
        const errorStream = new Readable();
        errorStream._read = () => {
          errorStream.emit('error', new Error('Error stream RdfObjectLoader-test'));
        };
        await expect(loader.import(errorStream)).rejects.toThrowError('Error stream RdfObjectLoader-test');
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
        ex: 'http://example.org/',
        myP: 'http://example.org/p',
        myP1: 'http://example.org/p1',
        myP2: 'http://example.org/p2',
        'ex:disabled': null,
        Type: 'http://example.org/Type',
        '@vocab': 'http://vocab.org/',
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
      it('should handle literal string values', async() => {
        expect(loader.createCompactedResource('"abc"').term).toEqualRdfTerm(DF.literal('abc'));
      });

      it('should handle boolean values', async() => {
        expect(loader.createCompactedResource(true).term).toEqualRdfTerm(DF.literal('true'));
      });

      it('should handle number values', async() => {
        expect(loader.createCompactedResource(123).term).toEqualRdfTerm(DF.literal('123'));
      });

      it('should handle IRI string values', async() => {
        expect(loader.createCompactedResource('http://example.org/').term)
          .toEqualRdfTerm(DF.namedNode('http://example.org/'));
      });

      it('should handle compacted IRI string values', async() => {
        expect(loader.createCompactedResource('ex:abc').term)
          .toEqualRdfTerm(DF.namedNode('http://example.org/abc'));
      });

      it('should handle disabled IRI string values', async() => {
        expect(loader.createCompactedResource('ex:disabled').term.termType)
          .toEqual('BlankNode');
      });

      it('should handle resource values', async() => {
        const resource = new Resource({ term: DF.blankNode() });
        expect(loader.createCompactedResource(resource)).toBe(resource);
      });

      it('should handle term values', async() => {
        const term = DF.blankNode();
        expect(loader.createCompactedResource(term).term).toBe(term);
      });

      it('should handle an empty hash', async() => {
        expect(loader.createCompactedResource({})!.term).toEqualRdfTerm(DF.blankNode());
      });

      it('should handle a hash with @id', async() => {
        expect(loader.createCompactedResource({
          '@id': 'http://example.org/id',
        })!.term).toEqualRdfTerm(DF.namedNode('http://example.org/id'));
      });

      it('should handle a hash with compacted @id', async() => {
        expect(loader.createCompactedResource({
          '@id': 'ex:id',
        })!.term).toEqualRdfTerm(DF.namedNode('http://example.org/id'));
      });

      it('should handle a hash with disabled @id', async() => {
        expect(loader.createCompactedResource({
          '@id': 'ex:disabled',
        }).term.termType).toEqual('BlankNode');
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

      it('should handle a hash with list with compacted term', async() => {
        const resource = loader.createCompactedResource({
          list: [
            'ex:1',
          ],
        });
        expect(resource.list).toBeTruthy();
        expect(resource.list?.length).toBe(1);
        expect(resource.list![0].term).toEqualRdfTerm(DF.namedNode('http://example.org/1'));
      });

      it('should handle a hash with list with disabled term', async() => {
        const resource = loader.createCompactedResource({
          list: [
            'ex:disabled',
            'ex:2',
          ],
        });
        expect(resource.list).toBeTruthy();
        expect(resource.list?.length).toBe(2);
        expect(resource.list![0].term).toEqualRdfTerm(DF.blankNode());
        expect(resource.list![1].term).toEqualRdfTerm(DF.namedNode('http://example.org/2'));
      });

      it('should handle a hash with a property array', async() => {
        const resource = loader.createCompactedResource({
          prop: [ '"a"', '"b"' ],
        });
        expect(resource.property.prop.term).toEqualRdfTerm(DF.literal('a'));
        expect(resource.properties.prop[0].term).toEqualRdfTerm(DF.literal('a'));
        expect(resource.properties.prop[1].term).toEqualRdfTerm(DF.literal('b'));
      });

      it('should handle a hash with a property array with disabled value', async() => {
        const resource = loader.createCompactedResource({
          prop: [ 'ex:disabled', '"b"' ],
        });
        expect(resource.property.prop.term).toEqualRdfTerm(DF.blankNode());
        expect(resource.properties.prop[0].term).toEqualRdfTerm(DF.blankNode());
        expect(resource.properties.prop[1].term).toEqualRdfTerm(DF.literal('b'));
      });

      it('should handle a hash with a singular property', async() => {
        const resource = loader.createCompactedResource({
          prop: '"a"',
        });
        expect(resource.property.prop.term).toEqualRdfTerm(DF.literal('a'));
      });

      it('should handle a hash with a singular disabled property', async() => {
        const resource = loader.createCompactedResource({
          prop: 'ex:disabled',
        });
        expect(resource.property.prop.term).toEqualRdfTerm(DF.blankNode());
      });

      it('should handle a hash with a singular property and @id', async() => {
        const resource = loader.createCompactedResource({
          '@id': 'ex:abc',
          prop: '"a"',
        });
        expect(resource.term).toEqualRdfTerm(DF.namedNode('http://example.org/abc'));
        expect(resource.property.prop.term).toEqualRdfTerm(DF.literal('a'));
      });

      it('should handle @type', async() => {
        const resource = loader.createCompactedResource({
          '@id': 'ex:abc',
          '@type': 'ex:Type',
        });
        expect(resource.term).toEqualRdfTerm(DF.namedNode('http://example.org/abc'));
        expect(resource.propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].term)
          .toEqualRdfTerm(DF.namedNode('http://example.org/Type'));
      });

      it('should handle @type using @vocab', async() => {
        const resource = loader.createCompactedResource({
          '@id': 'ex:abc',
          '@type': 'Type2',
        });
        expect(resource.term).toEqualRdfTerm(DF.namedNode('http://example.org/abc'));
        expect(resource.propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].term)
          .toEqualRdfTerm(DF.namedNode('http://vocab.org/Type2'));
      });

      it('should handle multiple @types', async() => {
        const resource = loader.createCompactedResource({
          '@id': 'ex:abc',
          '@type': [ 'ex:Type1', 'Type2' ],
        });
        expect(resource.term).toEqualRdfTerm(DF.namedNode('http://example.org/abc'));
        expect(resource.propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].term)
          .toEqualRdfTerm(DF.namedNode('http://example.org/Type1'));
        expect(resource.propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][1].term)
          .toEqualRdfTerm(DF.namedNode('http://vocab.org/Type2'));
      });

      it('should handle @type with resource', async() => {
        const resource = loader.createCompactedResource({
          '@id': 'ex:abc',
          '@type': { '@id': 'ex:Type' },
        });
        expect(resource.term).toEqualRdfTerm(DF.namedNode('http://example.org/abc'));
        expect(resource.propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].term)
          .toEqualRdfTerm(DF.namedNode('http://example.org/Type'));
      });

      it('should handle @type with blank node', async() => {
        context = {
          Nullified: null,
        };
        loader = new RdfObjectLoader({ context });
        await loader.context;

        const resource = loader.createCompactedResource({
          '@id': 'ex:abc',
          '@type': 'Nullified',
        });
        expect(resource.term).toEqualRdfTerm(DF.namedNode('ex:abc'));
        expect(resource.propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].term)
          .toEqualRdfTerm(DF.blankNode());
      });
    });

    describe('createCompactedResources', () => {
      it('should a hash', async() => {
        expect(loader.createCompactedResources({
          '@id': 'http://example.org/id',
        })[0]!.term).toEqualRdfTerm(DF.namedNode('http://example.org/id'));
      });

      it('should an array of hashes', async() => {
        const resources = loader.createCompactedResources([
          {
            '@id': 'http://example.org/id1',
          },
          {
            '@id': 'http://example.org/id2',
          },
        ]);
        expect(resources.length).toEqual(2);
        expect(resources[0].term).toEqualRdfTerm(DF.namedNode('http://example.org/id1'));
        expect(resources[1].term).toEqualRdfTerm(DF.namedNode('http://example.org/id2'));
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
