# RDF Object

[![Build Status](https://travis-ci.org/rubensworks/rdf-object.js.svg?branch=master)](https://travis-ci.org/rubensworks/rdf-object.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdf-object.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdf-object.js?branch=master)
[![npm version](https://badge.fury.io/js/rdf-object.svg)](https://www.npmjs.com/package/rdf-object)

RDF Object makes it easier to read RDF data
by loading it as JSON objects.

This library accepts [RDFJS](http://rdf.js.org/)-compliant quads.

## Installation

```bash
$ yarn install rdf-object
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Require

```javascript
import {RdfObjectLoader} from "rdf-object";
```

_or_

```javascript
const RdfObjectLoader = require("rdf-object").RdfObjectLoader;
```

## Usage

`RdfObjectLoader` accepts RDF quad/triple streams (or arrays) as input,
and loads the resulting graph in-memory as linked `Resource`s.

A `Resource` is a wrapper over an [RDFJS term](http://rdf.js.org/#term-interface) that holds property links.
Using a [JSON-LD context](https://json-ld.org/),
properties are easily accessible.

## Examples

The following examples assume the following imports:

```javascript
import {namedNode, literal, triple} from "@rdfjs/data-model"; // External library
import {RdfObjectLoader} from "rdf-object";
```

### Create an object loader

`RdfObjectLoader` accepts a JSON-LD context as input argument.

This context can also be the URL to a JSON-LD context.

```javascript
// Initialize our loader with a JSON-LD context
const context = {
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'type': 'rdf:type',
  'label': 'rdfs:label',
  'foaf': 'http://xmlns.com/foaf/0.1/',
  'knows': 'foaf:knows',
  'name': 'foaf:name',
  'ex': 'http://example.org/'
};
const myLoader = new RdfObjectLoader({ context });
```

### Get resources after importing

Resources are stored inside the `resources` field of `RdfObjectLoader`,
they are indexed by URI.

Each resource has the following fields:
* `value`: The term value. For example a URI or literal value.
* `type`: The [RDFJS term type](http://rdf.js.org/#term-interface).
* `term`: The [RDFJS term](http://rdf.js.org/#term-interface).

```javascript
// Import triples
myLoader.importArray([
  triple(namedNode('http://example.org/myResource'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/Resource')),
]).then(() => {
  // Get property values by shortcut
  const myResource = myLoader.resources['http://example.org/myResource'];
  console.log(`URI:  ${myResource.value}`);
  console.log(`Term type: ${myResource.type}`);
  console.log(`Term value: ${myResource.value}`);
  console.log(`Term: ${myResource.term}`);
});
```

Alternatively, `myLoader.import()` can be invoked on
an [RDFJS stream of triples/quads](http://rdf.js.org/#stream-interface).
This can for example accept [parsed turtle streams](https://www.npmjs.com/package/n3#from-an-rdf-stream-to-quads).

Multiple calls to `importArray` and `import` can be done at any time
to easily combined multiple sources.

### Get properties by shortcut

The `property` field on a `Resource`
contains all property values.
It maps all _predicates_ to _objects_,
where each _predicate_ is a URI or JSON-LD shortcut,
and each _object_ is a `Resource`.

If multiple values are present for that property,
only the first will be returned.

```javascript
// Import triples
myLoader.importArray([
  triple(namedNode('http://example.org/myResource'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/Resource')),
  triple(namedNode('http://example.org/myResource'), namedNode('http://www.w3.org/2000/01/rdf-schema#label'), literal('My Resource')),
]).then(() => {
  // Get property values by shortcut
  const myResource = myLoader.resources['http://example.org/myResource'];
  console.log(`URI:  ${myResource}`);
  console.log(`Type: ${myResource.property.type}`);
  console.log(`Label: ${myResource.property['rdfs:label']}`);
  console.log(`Label (bis): ${myResource.property['http://www.w3.org/1999/02/22-rdf-syntax-ns#label']}`);
});
```

### Get multiple property values

Via the `properties` field on `Resource`,
all values of a property can be retrieved.

JSON-LD can also be used on `properties`.

```javascript
// Import triples
myLoader.importArray([
  triple(namedNode('http://example.org/myResource'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/Resource')),
  triple(namedNode('http://example.org/myResource'), namedNode('http://www.w3.org/2000/01/rdf-schema#label'), literal('My Resource')),
]).then(() => {
  // Get property values by shortcut
  const myResource = myLoader.resources['http://example.org/myResource'];
  console.log(`Labels: ${myResource.properties.label}`);
});
```

The raw properties (without JSON-LD shortcuts) are
available in the `propertiesUri` field on `Resource`.

### Set properties by shortcut

The `property` and `properties` field can also be used to _set_ new values on a resource.

For example:
```javascript
// Sets a single property value
myResource.property['rdfs:label'] = new Resource({ term: literal('Name') });

// Sets multiple property values
myResource.properties['rdfs:label'].push(new Resource({ term: literal('Name 1') }));
myResource.properties['rdfs:label'].push(new Resource({ term: literal('Name 2') }));
```

### Resources are nested

As `Resource` properties map to other `Resource`s,
nested property paths can be followed easily.

```javascript
// Import triples
myLoader.importArray([
  triple(namedNode('https://www.rubensworks.net/#me'), namedNode('http://xmlns.com/foaf/0.1/knows'), namedNode('https://ruben.verborgh.org/profile/#me')),
  triple(namedNode('https://www.rubensworks.net/#me'), namedNode('http://xmlns.com/foaf/0.1/knows'), namedNode('https://data.verborgh.org/people/joachim_van_herwegen')),
  triple(namedNode('https://www.rubensworks.net/#me'), namedNode('http://xmlns.com/foaf/0.1/name'), literal('Ruben Taelman')),
  triple(namedNode('https://ruben.verborgh.org/profile/#me'), namedNode('http://xmlns.com/foaf/0.1/name'), literal('Ruben Verborgh')),
  triple(namedNode('https://data.verborgh.org/people/joachim_van_herwegen'), namedNode('http://xmlns.com/foaf/0.1/name'), literal('Joachim Van Herwegen')),
]).then(() => {
  // Get friend names via nested resources
  const rubenT = myLoader.resources['https://www.rubensworks.net/#me'];
  console.log(`Friends of ${rubenT.property.name}:`);
  for (const friend of rubenT.properties.friends) {
    console.log(`* ${friend.property.name}`);
  }
});
```

### Conveniently access RDF lists

RDF lists are automatically parsed
and exposed as a JavaScript array via the
`list` field on `Resource`.

```javascript
// Import triples
myLoader.importArray([
  triple(namedNode('http://example.org/myResource'), namedNode('http://example.org/list'), namedNode('http://example.org/myList0')),
  triple(namedNode('http://example.org/myList0'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'), literal('A')),
  triple(namedNode('http://example.org/myList0'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'), namedNode('http://example.org/myList1')),
  triple(namedNode('http://example.org/myList1'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'), literal('B')),
  triple(namedNode('http://example.org/myList1'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'), namedNode('http://example.org/myList2')),
  triple(namedNode('http://example.org/myList2'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'), literal('C')),
  triple(namedNode('http://example.org/myList2'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')),
]).then(() => {
  // Get friend names via nested resources
  const myResource = myLoader.resources['http://example.org/myResource'];
  console.log(`List values of ${myResource}`);
  for (const listElement of myResource.property['ex:list'].list) {
    console.log(`* ${listElement}`);
  }
});
```

If you don't want RDF lists to be parsed automatically,
you can set `normalizeLists` to `false` in the `RdfObjectLoader` constructor.

### Conveniently construct Resources

If you want to create custom Resources yourself, for example during testing,
then you can create them for any given term:

```javascript
myLoader.getOrMakeResource(namedNode('ex:myResource'));
```

Alternatively, you can use `createCompactedResource` to easily create a resource with compacted properties:
```javascript
myLoader.createCompactedResource({
  '@id': 'http://example.org/myId',
  propertyLiteral: '"abc"',
  propertyWithList: {
    list: [
      '"abc"'
    ]
  },
  propertyWithNestedHash: {
    nestedProperty: {
      '@id': 'http://example.org/mySubId',
    }
  },
  propertyWithResource: myLoader.getOrMakeResource(namedNode('ex:myResource')),
});
```
Special field cases:
* '@id' represents the IRI identifier.
* 'list' is considered an RDF list.

Values can be nested hashes, for which other Resources will be created.
String values will be converted into term sources following the semantics of [rdf-string.js](https://github.com/rubensworks/rdf-string.js#string-to-term).
Values can also be Resources or RDF/JS terms.

`createCompactedResources` is equivalent, but accepts an array (or hash) as input,
and converts it into an array of resources.

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
