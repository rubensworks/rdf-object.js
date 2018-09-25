import {literal, namedNode} from "@rdfjs/data-model";
import {RdfObjectLoader} from "../lib/RdfObjectLoader";
import {Resource} from "../lib/Resource";

// tslint:disable:no-var-requires
const streamifyArray = require('streamify-array');
const quad = require('rdf-quad');

describe('RdfObjectLoader', () => {
  describe('an instance without context', () => {

    let loader: RdfObjectLoader;

    beforeEach(() => {
      loader = new RdfObjectLoader();
    });

    describe('import', () => {

      it('should import an empty stream', async () => {
        await loader.import(streamifyArray([]));
        expect(loader.resources).toEqual({});
      });

      it('should import with one quad', async () => {
        await loader.import(streamifyArray([
          quad('http://example.org/s', 'http://example.org/p', 'http://example.org/o'),
        ]));
        const resourceO = loader.getOrMakeResource(namedNode('http://example.org/o'));
        const resourceP = loader.getOrMakeResource(namedNode('http://example.org/p'));
        const resourceS = loader.getOrMakeResource(namedNode('http://example.org/s'));
        resourceS.addProperty(resourceP, resourceO);
        expect(loader.resources).toEqual({
          'http://example.org/o': resourceO,
          'http://example.org/p': resourceP,
          'http://example.org/s': resourceS,
        });
      });

      it('should import with two linked quads', async () => {
        await loader.import(streamifyArray([
          quad('http://example.org/a', 'http://example.org/p1', 'http://example.org/b'),
          quad('http://example.org/b', 'http://example.org/p2', 'http://example.org/c'),
        ]));
        const resourceA = loader.getOrMakeResource(namedNode('http://example.org/a'));
        const resourceB = loader.getOrMakeResource(namedNode('http://example.org/b'));
        const resourceC = loader.getOrMakeResource(namedNode('http://example.org/c'));
        const resourceP1 = loader.getOrMakeResource(namedNode('http://example.org/p1'));
        const resourceP2 = loader.getOrMakeResource(namedNode('http://example.org/p2'));
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

      it('should normalize a list', async () => {
        await loader.import(streamifyArray([
          quad('http://example.org/listResource', 'http://example.org/listPredicate', 'http://example.org/l0'),
          quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"A"'),
          quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l1'),
          quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"B"'),
          quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l2'),
          quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"C"'),
          quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
        ]));
        const valueA = loader.getOrMakeResource(literal('A'));
        const valueB = loader.getOrMakeResource(literal('B'));
        const valueC = loader.getOrMakeResource(literal('C'));
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

      it('should import an empty stream', async () => {
        await loader.import(streamifyArray([]));
        expect(loader.resources).toEqual({});
      });

      it('should import with one quad', async () => {
        await loader.import(streamifyArray([
          quad('http://example.org/s', 'http://example.org/p', 'http://example.org/o'),
        ]));
        const resourceO = loader.getOrMakeResource(namedNode('http://example.org/o'));
        const resourceP = loader.getOrMakeResource(namedNode('http://example.org/p'));
        const resourceS = loader.getOrMakeResource(namedNode('http://example.org/s'));
        resourceS.addProperty(resourceP, resourceO);
        expect(loader.resources).toEqual({
          'http://example.org/o': resourceO,
          'http://example.org/p': resourceP,
          'http://example.org/s': resourceS,
        });
      });

      it('should import with two linked quads', async () => {
        await loader.import(streamifyArray([
          quad('http://example.org/a', 'http://example.org/p1', 'http://example.org/b'),
          quad('http://example.org/b', 'http://example.org/p2', 'http://example.org/c'),
        ]));
        const resourceA = loader.getOrMakeResource(namedNode('http://example.org/a'));
        const resourceB = loader.getOrMakeResource(namedNode('http://example.org/b'));
        const resourceC = loader.getOrMakeResource(namedNode('http://example.org/c'));
        const resourceP1 = loader.getOrMakeResource(namedNode('http://example.org/p1'));
        const resourceP2 = loader.getOrMakeResource(namedNode('http://example.org/p2'));
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

      it('should not normalize a list', async () => {
        await loader.import(streamifyArray([
          quad('http://example.org/listResource', 'http://example.org/listPredicate', 'http://example.org/l0'),
          quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"A"'),
          quad('http://example.org/l0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l1'),
          quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"B"'),
          quad('http://example.org/l1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/l2'),
          quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', '"C"'),
          quad('http://example.org/l2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
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

      it('should import an empty stream in an array', async () => {
        await loader.importArray([]);
        expect(loader.resources).toEqual({});
      });

      it('should import with one quad in an array', async () => {
        await loader.importArray([
          quad('http://example.org/s', 'http://example.org/p', 'http://example.org/o'),
        ]);
        const resourceO = loader.getOrMakeResource(namedNode('http://example.org/o'));
        const resourceP = loader.getOrMakeResource(namedNode('http://example.org/p'));
        const resourceS = loader.getOrMakeResource(namedNode('http://example.org/s'));
        resourceS.addProperty(resourceP, resourceO);
        resourceS.addProperty(new Resource({ term: namedNode('myP') }), resourceO);
        expect(loader.resources).toEqual({
          'http://example.org/o': resourceO,
          'http://example.org/p': resourceP,
          'http://example.org/s': resourceS,
        });
      });

      it('should import with two linked quads in an array', async () => {
        await loader.importArray([
          quad('http://example.org/a', 'http://example.org/p1', 'http://example.org/b'),
          quad('http://example.org/b', 'http://example.org/p2', 'http://example.org/c'),
        ]);
        const resourceA = loader.getOrMakeResource(namedNode('http://example.org/a'));
        const resourceB = loader.getOrMakeResource(namedNode('http://example.org/b'));
        const resourceC = loader.getOrMakeResource(namedNode('http://example.org/c'));
        const resourceP1 = loader.getOrMakeResource(namedNode('http://example.org/p1'));
        const resourceP2 = loader.getOrMakeResource(namedNode('http://example.org/p2'));
        resourceA.addProperty(resourceP1, resourceB);
        resourceA.addProperty(new Resource({ term: namedNode('myP1') }), resourceB);
        resourceB.addProperty(resourceP2, resourceC);
        resourceB.addProperty(new Resource({ term: namedNode('myP2') }), resourceC);
        expect(loader.resources).toEqual({
          'http://example.org/a': resourceA,
          'http://example.org/b': resourceB,
          'http://example.org/c': resourceC,
          'http://example.org/p1': resourceP1,
          'http://example.org/p2': resourceP2,
        });
      });

    });
  });
});
