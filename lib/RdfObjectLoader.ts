import type * as RDF from '@rdfjs/types';
import type { JsonLdContextNormalized, JsonLdContext } from 'jsonld-context-parser';
import { ContextParser } from 'jsonld-context-parser';
import { DataFactory } from 'rdf-data-factory';
import { stringToTerm, termToString } from 'rdf-string';
import { RdfListMaterializer } from './RdfListMaterializer';
import { Resource } from './Resource';

/**
 * Take a stream or array of RDF quads and loads them as linked resources.
 */
export class RdfObjectLoader {
  private readonly dataFactory: RDF.DataFactory;
  public readonly normalizeLists: boolean;
  public readonly context: Promise<void>;
  public readonly resources: Record<string, Resource> = {};
  public contextResolved!: JsonLdContextNormalized;
  private contextError: Error | undefined;

  public constructor(args?: IRdfClassLoaderArgs) {
    this.dataFactory = args?.dataFactory || new DataFactory();
    this.normalizeLists = !args || !('normalizeLists' in args) || Boolean(args.normalizeLists);

    this.context = new ContextParser().parse(args && args.context || {})
      .then(contextResolved => {
        this.contextResolved = contextResolved;
      }).catch(error => {
        // Save our error so that we can optionally throw it in .import
        this.contextError = error;
      });
  }

  /**
   * Get the resource object for the given term.
   * If it does not exist, one will be created.
   * @param {Term} term An RDF term.
   * @return {Resource} A resource.
   */
  public getOrMakeResource(term: RDF.Term): Resource {
    const termString: string = termToString(term);
    let resource: Resource = this.resources[termString];
    if (!resource) {
      resource = new Resource({ term, context: this.contextResolved });
      this.resources[termString] = resource;
    }
    return resource;
  }

  /**
   * Create a resource for the given hash,
   * where all fields in the given hash are considered to be compacted properties that will be appended.
   *
   * Special field cases:
   * * '@id' represents the IRI identifier.
   * * 'list' is considered an RDF list.
   *
   * Values can be nested hashes, for which other Resources will be created.
   * String values will be converted into term sources following the semantics of rdf-string.js.
   * Values can also be Resources.
   *
   * @param hash A hash containing compacted properties.
   */
  public createCompactedResource(hash: any): Resource {
    // Create resource for string value
    if (typeof hash !== 'object') {
      if (typeof hash === 'string') {
        hash = this.contextResolved.expandTerm(hash);
        if (!hash) {
          return this.getOrMakeResource(this.dataFactory.blankNode());
        }
      } else {
        hash = `"${hash}"`;
      }
      return this.getOrMakeResource(stringToTerm(hash, this.dataFactory));
    }

    // Return resource as-is
    if (hash instanceof Resource) {
      return hash;
    }

    // Wrap terms in resources
    if ('termType' in hash && 'equals' in hash) {
      return this.getOrMakeResource(hash);
    }

    // Create resource for named node term by @id value, or blank node
    let term: RDF.Term;
    if (hash['@id']) {
      const expandedId = this.contextResolved.expandTerm(hash['@id']);
      if (expandedId) {
        term = this.dataFactory.namedNode(expandedId);
      } else {
        term = this.dataFactory.blankNode();
      }
    } else {
      term = this.dataFactory.blankNode();
    }
    const resource: Resource = this.getOrMakeResource(term);

    // Iterate over all entries in the hash
    for (const [ key, value ] of Object.entries(hash)) {
      // Skip keys starting with '@'
      if (key === '@type') {
        for (const subValue of Array.isArray(value) ? value : [ value ]) {
          let typeResource: Resource;
          if (typeof subValue === 'string') {
            const expandedId = this.contextResolved.expandTerm(subValue, true);
            let termType: RDF.Term;
            if (expandedId) {
              termType = this.dataFactory.namedNode(expandedId);
            } else {
              termType = this.dataFactory.blankNode();
            }
            typeResource = this.getOrMakeResource(termType);
          } else {
            typeResource = this.createCompactedResource(subValue);
          }
          resource.properties['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'].push(typeResource);
        }
      } else if (!key.startsWith('@')) {
        if (key === 'list') {
          // Handle RDF list entries
          resource.list = [];
          for (const subValue of Array.isArray(value) ? value : [ value ]) {
            resource.list.push(this.createCompactedResource(subValue));
          }
        } else {
          // Handle compacted properties
          for (const subValue of Array.isArray(value) ? value : [ value ]) {
            if (subValue !== undefined) {
              resource.properties[key].push(this.createCompactedResource(subValue));
            }
          }
        }
      }
    }
    return resource;
  }

  /**
   * Create resources for the given hash or array by delegating array entries to {@link createCompactedResource}.
   * @param hashOrArray A hash or array of hashes containing compacted properties.
   */
  public createCompactedResources(hashOrArray: any): Resource[] {
    if (Array.isArray(hashOrArray)) {
      return hashOrArray.map(hash => this.createCompactedResource(hash));
    }
    return [ this.createCompactedResource(hashOrArray) ];
  }

  /**
   * Import the given stream of RDF quads.
   * Resources will be created and linked for all passed terms.
   * @param {Stream} stream A stream of RDF quads.
   * @return {Promise<void>} A promise that resolves when the stream has ended.
   * @template Q The type of quad, defaults to RDF.Quad.
   */
  public async import<Q extends RDF.BaseQuad = RDF.Quad>(stream: RDF.Stream<Q>): Promise<void> {
    await this.context;
    const listMaterializer = new RdfListMaterializer();
    let listMaterializerPromise;
    if (this.normalizeLists) {
      listMaterializerPromise = listMaterializer.import(stream);
    }

    // Wait until stream has been handled completely
    const streamPromise = new Promise<void>((resolve, reject) => {
      stream.on('data', (quad: Q) => {
        const subject: Resource = this.getOrMakeResource(quad.subject);
        const predicate: Resource = this.getOrMakeResource(quad.predicate);
        const object: Resource = this.getOrMakeResource(quad.object);
        // Handle empty RDF lists
        if (this.normalizeLists && object.term.equals(RdfListMaterializer.RDF_NIL)) {
          object.list = [];
        }
        subject.addProperty(predicate, object);
      });
      stream.on('error', reject);
      stream.on('end', () => {
        if (this.normalizeLists) {
          for (const listRoot of listMaterializer.getRoots()) {
            const listTerms = listMaterializer.getList(listRoot);
            this.resources[termToString(listRoot)].list = listTerms!.map(term => this.resources[termToString(term)]);
          }
        }
        resolve();
      });
    });

    // Catches errors from stream and list materialization
    await Promise.all([ streamPromise, listMaterializerPromise ]);
    if (this.contextError) {
      throw this.contextError;
    }
  }

  /**
   * Import the given array of RDF quads.
   * Resources will be created and linked for all passed terms.
   * @param {Q[]} quads An array of RDF quads.
   * @return {Promise<void>} A promise that resolves when the array has been fully imported.
   * @template Q The type of quad, defaults to RDF.Quad.
   */
  public importArray<Q extends RDF.BaseQuad = RDF.Quad>(quads: Q[]): Promise<void> {
    return this.import(require('streamify-array')(quads));
  }
}

export interface IRdfClassLoaderArgs {
  /**
   * If RDF lists should be loaded into the Resource.list field.
   * Defaults to true.
   */
  normalizeLists?: boolean;
  /**
   * The JSON-LD context to use for expanding and compacting.
   */
  context?: JsonLdContext;
  /**
   * The factory to create RDF terms and quads with.
   */
  dataFactory?: RDF.DataFactory;
}
