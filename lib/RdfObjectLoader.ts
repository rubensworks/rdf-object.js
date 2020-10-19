import type { JsonLdContextNormalized, JsonLdContext } from 'jsonld-context-parser';
import { ContextParser } from 'jsonld-context-parser';
import type * as RDF from 'rdf-js';
import { termToString } from 'rdf-string';
import { RdfListMaterializer } from './RdfListMaterializer';
import { Resource } from './Resource';

/**
 * Take a stream or array of RDF quads and loads them as linked resources.
 */
export class RdfObjectLoader {
  public readonly normalizeLists: boolean;
  public readonly context: Promise<void>;
  public readonly resources: Record<string, Resource> = {};
  private contextResolved!: JsonLdContextNormalized;
  private contextError: Error | undefined;

  public constructor(args?: IRdfClassLoaderArgs) {
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
    await new Promise((resolve, reject) => {
      stream.on('data', (quad: Q) => {
        const subject: Resource = this.getOrMakeResource(quad.subject);
        const predicate: Resource = this.getOrMakeResource(quad.predicate);
        const object: Resource = this.getOrMakeResource(quad.object);
        subject.addProperty(predicate, object);
      });
      stream.on('error', reject);
      stream.on('end', () => {
        if (this.normalizeLists) {
          for (const listRoot of listMaterializer.getRoots()) {
            const listTerms = <RDF.Term[]> listMaterializer.getList(listRoot);
            this.resources[termToString(listRoot)].list = listTerms.map(term => this.resources[termToString(term)]);
          }
        }
        resolve();
      });
    });

    // Catches errors from list materialization
    await listMaterializerPromise;
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
}
