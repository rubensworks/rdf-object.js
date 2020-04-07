import {namedNode} from "@rdfjs/data-model";
import * as RDF from "rdf-js";
import {Resource} from "../lib/Resource";
import {JsonLdContextNormalized} from "jsonld-context-parser";

const context = new JsonLdContextNormalized({
  ex: 'http://example.org/',
});

describe('Resource', () => {
  describe('constructed with a named node', () => {
    let term: RDF.Term;
    let resource: Resource;

    beforeEach(() => {
      term = namedNode('http://example.org/resource1');
      resource = new Resource({ term });
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
      return expect(resource.isA(namedNode('http://example.org/resource1'))).toBeTruthy();
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
  });

  describe('constructed with a named node and a property', () => {
    let term: RDF.Term;
    let resource: Resource;
    let predicate: Resource;
    let object: Resource;

    beforeEach(() => {
      term = namedNode('http://example.org/resource2');
      resource = new Resource({ term, context });
      predicate = new Resource({ term: namedNode('http://example.org/predicate1'), context });
      object = new Resource({ term: namedNode('http://example.org/object1'), context });
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
      return expect(resource.isA(namedNode('http://example.org/resource2'))).toBeTruthy();
    });

    it('should have 1 predicate', () => {
      return expect(resource.predicates).toEqual([predicate]);
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
      term = namedNode('http://example.org/resource');
      resource = new Resource({ term, context });
      resource.addProperty(
        new Resource({ term: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), context }),
        new Resource({ term: namedNode('http://example.org/Type1'), context }),
      );
      resource.addProperty(
        new Resource({ term: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), context }),
        new Resource({ term: namedNode('http://example.org/Type2'), context }),
      );
      resource.addProperty(
        new Resource({ term: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), context }),
        new Resource({ term: namedNode('http://example.org/Type3'), context }),
      );
    });

    it('should be itself', () => {
      return expect(resource.isA(namedNode('http://example.org/resource'))).toBeTruthy();
    });

    it('should be of Type1', () => {
      return expect(resource.isA(namedNode('http://example.org/Type1'))).toBeTruthy();
    });

    it('should be of Type2', () => {
      return expect(resource.isA(namedNode('http://example.org/Type2'))).toBeTruthy();
    });

    it('should be of Type3', () => {
      return expect(resource.isA(namedNode('http://example.org/Type3'))).toBeTruthy();
    });

    it('should not be of Type4', () => {
      return expect(resource.isA(namedNode('http://example.org/Type4'))).toBeFalsy();
    });
  });
});
