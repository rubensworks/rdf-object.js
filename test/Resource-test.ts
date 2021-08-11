import type * as RDF from '@rdfjs/types';
import { JsonLdContextNormalized } from 'jsonld-context-parser';
import { DataFactory } from 'rdf-data-factory';
import { Resource } from '../lib/Resource';
import 'jest-rdf';

const context = new JsonLdContextNormalized({
  ex: 'http://example.org/',
  disabled: null,
});
const DF = new DataFactory();

describe('Resource', () => {
  describe('constructed with a named node', () => {
    let term: RDF.Term;
    let resource: Resource;

    beforeEach(() => {
      term = DF.namedNode('http://example.org/resource1');
      resource = new Resource({ term, context });
    });

    it('should save the term', () => {
      return expect(resource.term).toBe(term);
    });

    it('should have the correct term type', () => {
      return expect(resource.type).toEqual('NamedNode');
    });

    it('should have the correct value', () => {
      return expect(resource.value).toEqual('http://example.org/resource1');
    });

    it('should have the correct toString() value', () => {
      return expect(resource.toString()).toEqual('http://example.org/resource1');
    });

    it('should be itself', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/resource1'))).toBeTruthy();
    });

    it('should be itself for a compacted term', () => {
      return expect(resource.isA('ex:resource1')).toBeTruthy();
    });

    it('should not be a different compacted term', () => {
      return expect(resource.isA('ex:resource2')).toBeFalsy();
    });

    it('should be false for a disabled compacted term', () => {
      return expect(resource.isA('disabled')).toBeFalsy();
    });

    it('should have no predicates', () => {
      return expect(resource.predicates).toEqual([]);
    });

    it('should have no properties by URI', () => {
      return expect(resource.propertiesUri).toEqual({});
    });

    it('should have no properties by shortcut', () => {
      return expect(resource.properties).toEqual({});
    });

    it('should have no properties by single value', () => {
      return expect(resource.property).toEqual({});
    });

    describe('property', () => {
      it('should allow a property to be added', () => {
        resource.property['ex:a'] = new Resource({ term: DF.literal('value') });
        expect(resource.property['ex:a'].term).toEqual(DF.literal('value'));
      });

      it('should allow property to be overridden', () => {
        resource.property['ex:a'] = new Resource({ term: DF.literal('value1') });
        resource.property['ex:a'] = new Resource({ term: DF.literal('value2') });
        expect(resource.property['ex:a'].term).toEqual(DF.literal('value2'));
      });
    });

    describe('properties', () => {
      it('should allow a property to be added', () => {
        resource.properties['ex:a'].push(new Resource({ term: DF.literal('value') }));
        expect(resource.properties['ex:a'][0].term).toEqual(DF.literal('value'));
      });

      it('should allow property to be overridden', () => {
        resource.properties['ex:a'].push(new Resource({ term: DF.literal('value1') }));
        resource.properties['ex:a'].push(new Resource({ term: DF.literal('value2') }));
        expect(resource.properties['ex:a'][0].term).toEqual(DF.literal('value1'));
        expect(resource.properties['ex:a'][1].term).toEqual(DF.literal('value2'));
      });
    });

    describe('toJSON', () => {
      it('without properties and list', () => {
        expect(resource.toJSON()).toEqual('http://example.org/resource1');
      });

      it('with properties', () => {
        resource.properties['ex:a'].push(new Resource({ term: DF.literal('value1') }));
        resource.properties['ex:b'].push(new Resource({ term: DF.literal('value2') }));
        expect(resource.toJSON()).toEqual({
          '@id': 'http://example.org/resource1',
          properties: {
            'http://example.org/a': [
              '"value1"',
            ],
            'http://example.org/b': [
              '"value2"',
            ],
          },
        });
      });

      it('with list', () => {
        resource.list = [];
        resource.list.push(new Resource({ term: DF.literal('value1') }));
        resource.list.push(new Resource({ term: DF.literal('value2') }));
        expect(resource.toJSON()).toEqual({
          '@id': 'http://example.org/resource1',
          list: [
            '"value1"',
            '"value2"',
          ],
        });
      });

      it('with list and properties', () => {
        resource.properties['ex:a'].push(new Resource({ term: DF.literal('value1') }));
        resource.properties['ex:b'].push(new Resource({ term: DF.literal('value2') }));
        resource.list = [];
        resource.list.push(new Resource({ term: DF.literal('value1') }));
        resource.list.push(new Resource({ term: DF.literal('value2') }));
        expect(resource.toJSON()).toEqual({
          '@id': 'http://example.org/resource1',
          properties: {
            'http://example.org/a': [
              '"value1"',
            ],
            'http://example.org/b': [
              '"value2"',
            ],
          },
          list: [
            '"value1"',
            '"value2"',
          ],
        });
      });
    });
  });

  describe('constructed with a named node and a property', () => {
    let term: RDF.Term;
    let resource: Resource;
    let predicate: Resource;
    let object: Resource;

    beforeEach(() => {
      term = DF.namedNode('http://example.org/resource2');
      resource = new Resource({ term, context });
      predicate = new Resource({ term: DF.namedNode('http://example.org/predicate1'), context });
      object = new Resource({ term: DF.namedNode('http://example.org/object1'), context });
      resource.addProperty(predicate, object);
    });

    it('should save the term', () => {
      return expect(resource.term).toBe(term);
    });

    it('should have the correct term type', () => {
      return expect(resource.type).toEqual('NamedNode');
    });

    it('should have the correct value', () => {
      return expect(resource.value).toEqual('http://example.org/resource2');
    });

    it('should be itself', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/resource2'))).toBeTruthy();
    });

    it('should have 1 predicate', () => {
      return expect(resource.predicates).toEqual([ predicate ]);
    });

    it('should have no properties by URI', () => {
      return expect(resource.propertiesUri).toEqual({
        'http://example.org/predicate1': [ object ],
      });
    });

    it('should have no properties by shortcut', () => {
      return expect(resource.properties['ex:predicate1']).toEqual([ object ]);
    });

    it('should have no properties by single value', () => {
      return expect(resource.property['ex:predicate1']).toEqual(object);
    });
  });

  describe('constructed with a named node and RDF types', () => {
    let term: RDF.Term;
    let resource: Resource;

    beforeEach(() => {
      term = DF.namedNode('http://example.org/resource');
      resource = new Resource({ term, context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type1'), context }),
      );
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type2'), context }),
      );
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type3'), context }),
      );
    });

    it('should be itself', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/resource'))).toBeTruthy();
    });

    it('should be of Type1', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type1'))).toBeTruthy();
    });

    it('should be of Type2', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type2'))).toBeTruthy();
    });

    it('should be of Type3', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type3'))).toBeTruthy();
    });

    it('should not be of Type4', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type4'))).toBeFalsy();
    });
  });

  describe('constructed with RDFS subclasses', () => {
    let term: RDF.Term;
    let resource: Resource;

    beforeEach(() => {
      term = DF.namedNode('http://example.org/resource');
      resource = new Resource({ term, context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type1'), context }),
      );
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type2'), context }),
      );
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type3'), context }),
      );
    });

    it('should be itself', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/resource'))).toBeTruthy();
    });

    it('should be of Type1', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type1'))).toBeTruthy();
    });

    it('should be of Type2', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type2'))).toBeTruthy();
    });

    it('should be of Type3', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type3'))).toBeTruthy();
    });

    it('should not be of Type4', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type4'))).toBeFalsy();
    });
  });

  describe('constructed with RDF types and RDFS subclasses', () => {
    let term: RDF.Term;
    let resource: Resource;

    beforeEach(() => {
      term = DF.namedNode('http://example.org/resource');
      resource = new Resource({ term, context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type1'), context }),
      );
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type2'), context }),
      );
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type3'), context }),
      );
    });

    it('should be itself', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/resource'))).toBeTruthy();
    });

    it('should be of Type1', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type1'))).toBeTruthy();
    });

    it('should be of Type2', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type2'))).toBeTruthy();
    });

    it('should be of Type3', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type3'))).toBeTruthy();
    });

    it('should not be of Type4', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type4'))).toBeFalsy();
    });
  });

  describe('constructed with chained RDF types and RDFS subclasses', () => {
    let term: RDF.Term;
    let resource: Resource;

    beforeEach(() => {
      term = DF.namedNode('http://example.org/resource');
      resource = new Resource({ term, context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type1'), context }),
      );
      resource.propertiesUri['http://www.w3.org/2000/01/rdf-schema#subClassOf'][0].addProperty(
        new Resource({ term: DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), context }),
        new Resource({ term: DF.namedNode('http://example.org/Type2'), context }),
      );
      resource.propertiesUri['http://www.w3.org/2000/01/rdf-schema#subClassOf'][0]
        .propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].addProperty(
          new Resource({ term: DF.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), context }),
          new Resource({ term: DF.namedNode('http://example.org/Type3'), context }),
        );
    });

    it('should be itself', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/resource'))).toBeTruthy();
    });

    it('should be of Type1', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type1'))).toBeTruthy();
    });

    it('should be of Type2', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type2'))).toBeTruthy();
    });

    it('should be of Type3', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type3'))).toBeTruthy();
    });

    it('should not be of Type4', () => {
      return expect(resource.isA(DF.namedNode('http://example.org/Type4'))).toBeFalsy();
    });
  });

  describe('toQuads', () => {
    it('should handle an empty resource', () => {
      const resource = new Resource({ term: DF.blankNode(), context });
      return expect(resource.toQuads()).toBeRdfIsomorphic([]);
    });

    it('should handle a resource with a raw property', () => {
      const resource = new Resource({ term: DF.blankNode(), context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p'), context }),
        new Resource({ term: DF.literal('o'), context }),
      );
      return expect(resource.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.blankNode(), DF.namedNode('ex:p'), DF.literal('o')),
      ]);
    });

    it('should handle a resource with raw properties', () => {
      const resource = new Resource({ term: DF.blankNode(), context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p1'), context }),
        new Resource({ term: DF.literal('o1'), context }),
      );
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p2'), context }),
        new Resource({ term: DF.literal('o2'), context }),
      );
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p3'), context }),
        new Resource({ term: DF.literal('o3'), context }),
      );
      return expect(resource.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.blankNode('b1'), DF.namedNode('ex:p1'), DF.literal('o1')),
        DF.quad(DF.blankNode('b1'), DF.namedNode('ex:p2'), DF.literal('o2')),
        DF.quad(DF.blankNode('b1'), DF.namedNode('ex:p3'), DF.literal('o3')),
      ]);
    });

    it('should handle nested resources', () => {
      const resourceSub = new Resource({ term: DF.namedNode('ex:s'), context });
      resourceSub.addProperty(
        new Resource({ term: DF.namedNode('ex:p2'), context }),
        new Resource({ term: DF.literal('o2'), context }),
      );
      const resource = new Resource({ term: DF.blankNode(), context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p1'), context }),
        resourceSub,
      );
      return expect(resource.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.blankNode(), DF.namedNode('ex:p1'), DF.namedNode('ex:s')),
        DF.quad(DF.namedNode('ex:s'), DF.namedNode('ex:p2'), DF.literal('o2')),
      ]);
    });

    it('should handle empty RDF lists', () => {
      const resourceList = new Resource({ term: DF.blankNode(), context });
      resourceList.list = [];
      const resource = new Resource({ term: DF.blankNode(), context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p1'), context }),
        resourceList,
      );
      return expect(resource.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.blankNode(), DF.namedNode('ex:p1'), DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')),
      ]);
    });

    it('should handle RDF list of size 1', () => {
      const resourceList = new Resource({ term: DF.blankNode(), context });
      resourceList.list = [
        new Resource({ term: DF.literal('a'), context }),
      ];
      const resource = new Resource({ term: DF.blankNode(), context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p1'), context }),
        resourceList,
      );
      return expect(resource.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.blankNode(), DF.namedNode('ex:p1'), DF.blankNode('l1')),
        DF.quad(DF.blankNode('l1'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
          DF.literal('a')),
        DF.quad(DF.blankNode('l1'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')),
      ]);
    });

    it('should handle RDF list of size 2', () => {
      const resourceList = new Resource({ term: DF.blankNode(), context });
      resourceList.list = [
        new Resource({ term: DF.literal('a'), context }),
        new Resource({ term: DF.literal('b'), context }),
      ];
      const resource = new Resource({ term: DF.blankNode(), context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p1'), context }),
        resourceList,
      );
      return expect(resource.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.blankNode(), DF.namedNode('ex:p1'), DF.blankNode('l1')),
        DF.quad(DF.blankNode('l1'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
          DF.literal('a')),
        DF.quad(DF.blankNode('l1'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
          DF.blankNode('l2')),
        DF.quad(DF.blankNode('l2'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
          DF.literal('b')),
        DF.quad(DF.blankNode('l2'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')),
      ]);
    });

    it('should handle RDF list with nested resources', () => {
      const resourceList = new Resource({ term: DF.blankNode(), context });
      resourceList.list = [
        new Resource({ term: DF.namedNode('ex:a'), context }),
      ];
      resourceList.list[0].addProperty(
        new Resource({ term: DF.namedNode('ex:p2'), context }),
        new Resource({ term: DF.literal('o2'), context }),
      );
      const resource = new Resource({ term: DF.blankNode(), context });
      resource.addProperty(
        new Resource({ term: DF.namedNode('ex:p1'), context }),
        resourceList,
      );
      return expect(resource.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.blankNode(), DF.namedNode('ex:p1'), DF.blankNode('l1')),
        DF.quad(DF.blankNode('l1'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
          DF.namedNode('ex:a')),
        DF.quad(DF.blankNode('l1'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')),

        DF.quad(DF.namedNode('ex:a'), DF.namedNode('ex:p2'), DF.literal('o2')),
      ]);
    });

    it('should handle cyclic resources', () => {
      const resource1 = new Resource({ term: DF.namedNode('ex:s1'), context });
      const resource2 = new Resource({ term: DF.namedNode('ex:s2'), context });
      resource1.addProperty(
        new Resource({ term: DF.namedNode('ex:p1'), context }),
        resource2,
      );
      resource2.addProperty(
        new Resource({ term: DF.namedNode('ex:p2'), context }),
        resource1,
      );
      return expect(resource1.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:s2')),
        DF.quad(DF.namedNode('ex:s2'), DF.namedNode('ex:p2'), DF.namedNode('ex:s1')),
      ]);
    });

    it('should handle indirect cyclic resources', () => {
      const resource1 = new Resource({ term: DF.namedNode('ex:s1'), context });
      const resource2 = new Resource({ term: DF.namedNode('ex:s2'), context });
      const resource3 = new Resource({ term: DF.namedNode('ex:s3'), context });
      resource1.addProperty(
        new Resource({ term: DF.namedNode('ex:p1'), context }),
        resource2,
      );
      resource2.addProperty(
        new Resource({ term: DF.namedNode('ex:p2'), context }),
        resource3,
      );
      resource3.addProperty(
        new Resource({ term: DF.namedNode('ex:p3'), context }),
        resource1,
      );
      return expect(resource1.toQuads()).toBeRdfIsomorphic([
        DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:s2')),
        DF.quad(DF.namedNode('ex:s2'), DF.namedNode('ex:p2'), DF.namedNode('ex:s3')),
        DF.quad(DF.namedNode('ex:s3'), DF.namedNode('ex:p3'), DF.namedNode('ex:s1')),
      ]);
    });
  });
});
