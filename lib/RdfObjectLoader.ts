import {ContextParser, IJsonLdContextNormalized, JsonLdContext} from "jsonld-context-parser";
import * as RDF from "rdf-js";
import {termToString} from "rdf-string";
import {RdfListMaterializer} from "./RdfListMaterializer";
import {Resource} from "./Resource";

/**
 * Take a stream or array of RDF quads and loads them as linked resources.
 */
export class RdfObjectLoader {

  public readonly normalizeLists: boolean;
  public readonly context: Promise<IJsonLdContextNormalized>;
  public readonly resources: { [term: string]: Resource } = {};
  private contextResolved: IJsonLdContextNormalized;

  constructor(args?: IRdfClassLoaderArgs) {
    if (args) {
      Object.assign(this, args);
    }

    if (this.normalizeLists !== false) {
      this.normalizeLists = true;
    }
    this.context = new ContextParser().parse(this.context || {});
    this.context.then((contextResolved) => this.contextResolved = contextResolved);
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
  public import<Q extends RDF.BaseQuad = RDF.Quad>(stream: RDF.Stream<Q>): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.context;
      const listMaterializer = new RdfListMaterializer();
      if (this.normalizeLists) {
        listMaterializer.import(stream);
      }
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
            const listTerms = listMaterializer.getList(listRoot);
            this.resources[termToString(listRoot)].list = listTerms.map((term) => this.resources[termToString(term)]);
          }
        }
        resolve();
      });
    });
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
  normalizeLists?: boolean;
  context?: JsonLdContext;
}
