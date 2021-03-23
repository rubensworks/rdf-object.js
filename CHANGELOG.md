# Changelog
All notable changes to this project will be documented in this file.

<a name="v1.10.2"></a>
## [v1.10.2](https://github.com/rubensworks/rdf-object.js/compare/v1.10.1...v1.10.2) - 2021-03-23

### Fixed
* [Fix TS compilation issues related to ProxyHandler](https://github.com/rubensworks/rdf-object.js/commit/757436e78f57fa93161a7a6fb79f28e622a4589c)

<a name="v1.10.1"></a>
## [v1.10.1](https://github.com/rubensworks/rdf-object.js/compare/v1.10.0...v1.10.1) - 2021-03-04

### Fixed
* [Fix stackoverflow when calling toQuads on cyclic Resources, Closes #28](https://github.com/rubensworks/rdf-object.js/commit/0d897660cf67dde8d1d8aedaaaedb0fdf6c17967)

<a name="v1.10.0"></a>
## [v1.10.0](https://github.com/rubensworks/rdf-object.js/compare/v1.9.0...v1.10.0) - 2021-02-23

### Added
* [Add createCompactedResources helper](https://github.com/rubensworks/rdf-object.js/commit/8151ed947dca616b121db9a17df7cc19f34ad418)

<a name="v1.9.0"></a>
## [v1.9.0](https://github.com/rubensworks/rdf-object.js/compare/v1.8.0...v1.9.0) - 2021-02-22

### Added
* [Accept RDF/JS terms in compacted resources](https://github.com/rubensworks/rdf-object.js/commit/e6ddc5c13841734ba0cfc26c03abb903210ace28)

<a name="v1.8.0"></a>
## [v1.8.0](https://github.com/rubensworks/rdf-object.js/compare/v1.7.1...v1.8.0) - 2020-12-03

### Added
* [Also handle RDF lists in Resource#toQuads](https://github.com/rubensworks/rdf-object.js/commit/70dd1bdce52e6a7a653f0b4c4d3b55c5b1008a7f)

<a name="v1.7.1"></a>
## [v1.7.1](https://github.com/rubensworks/rdf-object.js/compare/v1.7.0...v1.7.1) - 2020-11-25

### Fixed
* [Fix crash on calling createCompactedResource with a non-string primitive](https://github.com/rubensworks/rdf-object.js/commit/37cbe90e39dc730a547a6cb3210dd1d481b5325a)

<a name="v1.7.0"></a>
## [v1.7.0](https://github.com/rubensworks/rdf-object.js/compare/v1.6.0...v1.7.0) - 2020-11-25

### Added
* [Handle compacted terms in createCompactedResource](https://github.com/rubensworks/rdf-object.js/commit/21e73deefa9e531d9c278df3dd78994bca53b09d)

<a name="v1.6.0"></a>
## [v1.6.0](https://github.com/rubensworks/rdf-object.js/compare/v1.5.0...v1.6.0) - 2020-11-24

### Added
* [Allow resources to be converted into a quad array with toQuads](https://github.com/rubensworks/rdf-object.js/commit/0cfb7bac733d9cc0ab393f293f222d22951e8ce5)

<a name="v1.5.0"></a>
## [v1.5.0](https://github.com/rubensworks/rdf-object.js/compare/v1.4.2...v1.5.0) - 2020-11-17

### Added
* [Allow compacted string parameters in Resource#isA](https://github.com/rubensworks/rdf-object.js/commit/d63d9b63dcd9acaf0191d94ae3af77463c5abdf4)

<a name="v1.4.2"></a>
## [v1.4.2](https://github.com/rubensworks/rdf-object.js/compare/v1.4.1...v1.4.2) - 2020-11-10

### Fixed
* [Fix subClassOf being checked for wrong URI](https://github.com/rubensworks/rdf-object.js/commit/e3a3a7d97413ed7b59252b0d007805b76a12fe9a)

<a name="v1.4.1"></a>
## [v1.4.1](https://github.com/rubensworks/rdf-object.js/compare/v1.4.0...v1.4.1) - 2020-11-04

### Fixed
* [Fix empty RDF lists not producing empty list array](https://github.com/rubensworks/rdf-object.js/commit/6e00df576504461bb62edb17a1c78bf8c8d3e3a1)

<a name="v1.4.0"></a>
## [v1.4.0](https://github.com/rubensworks/rdf-object.js/compare/v1.3.0...v1.4.0) - 2020-10-30

### Added
* [Add toJSON on Resource](https://github.com/rubensworks/rdf-object.js/commit/3fc635e4faad7f2b3c6c4649a44d0dc346ff3313)
* [Make contextResolved public](https://github.com/rubensworks/rdf-object.js/commit/4ddd61c90e56644014f536dc7445ccb9dc3776a0)
* [Handle property deletions](https://github.com/rubensworks/rdf-object.js/commit/116fa640197605615d62873bb1f64d03097e6e6e)
* [Add createCompactedResource helper](https://github.com/rubensworks/rdf-object.js/commit/8c22c98f5b19207ec7d6f1bd09f894670312bf82)
* [Add convenience Resource constructors](https://github.com/rubensworks/rdf-object.js/commit/e86542e3df64942a413043b91e2aef4bebc13ae0)
* [Allow properties to be set by shortcut](https://github.com/rubensworks/rdf-object.js/commit/8aebf52b4064eb688bc6faa4ab866d328f1148b9)

<a name="v1.3.0"></a>
## [v1.3.0](https://github.com/rubensworks/rdf-object.js/compare/v1.2.0...v1.3.0) - 2020-09-16

### Changed
* [Migrate to rdf-data-factory and @types/rdf-js 4.x](https://github.com/rubensworks/rdf-object.js/commit/b65bac5a99d2b4a4149dde1c199a3b44242f15c6)

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/rubensworks/rdf-object.js/compare/v1.1.0...v1.2.0) - 2020-04-07

### Changed
* [Bump to jsonld-context-parser 2.0.0 with support for JSON-LD 1.1, Closes #22](https://github.com/rubensworks/rdf-object.js/commit/5113bf2266c1d2249e62a19a028d62e65085e65b)

<a name="v1.1.1"></a>
## [v1.1.1](https://github.com/rubensworks/rdf-object.js/compare/v1.1.0...v1.1.1) - 2019-02-07

### Changed
* [Update to jsonld-context-parser@1.1.0](https://github.com/rubensworks/rdf-object.js/commit/9db628b2c3bbd8f37b82026e1fe944b6a3f5da9f)
* [Expand terms in vocab-mode](https://github.com/rubensworks/rdf-object.js/commit/24e1120f49ed649daed8afd74b7f57e9290958ef)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/rubensworks/rdf-object.js/compare/v1.0.0...v1.1.0) - 2018-11-08

### Changed
* [Update to generic RDFJS typings](https://github.com/rubensworks/rdf-object.js/commit/6aae54a3f43c1673e53e500346e2f6616b9a859f)

<a name="1.0.0"></a>
## [1.0.0] - 2018-09-25
Initial release
