import { DataFactory } from 'rdf-data-factory';
import type * as RDF from 'rdf-js';
import { stringToTerm, termToString } from 'rdf-string';

const DF = new DataFactory();

/**
 * A helper class for converting RDF lists to JavaScript RDF term term lists
 */
export class RdfListMaterializer {
  public static readonly RDF_FIRST: RDF.NamedNode = DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first');
  public static readonly RDF_REST: RDF.NamedNode = DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest');
  public static readonly RDF_NIL: RDF.NamedNode = DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil');

  private readonly chains: Record<string, { first: RDF.Term; rest: RDF.Term }> = {};

  protected static addChain(chains: Record<string, { first: RDF.Term; rest: RDF.Term }>, subject: RDF.Term,
    object: RDF.Term, type: 'first' | 'rest'): void {
    const hash: string = termToString(subject);
    if (!chains[hash]) {
      chains[hash] = <{ first: RDF.Term; rest: RDF.Term }> {};
    }
    chains[hash][type] = object;
  }

  protected static materializeChain(root: RDF.Term, chains: Record<string, { first: RDF.Term; rest: RDF.Term }>,
    array?: RDF.Term[]): RDF.Term[] | undefined {
    if (!array) {
      array = [];
    }

    const hash: string = termToString(root);
    const chain = chains[hash];
    if (chain && chain.first && chain.rest) {
      array.push(chain.first);
      if (!chain.rest.equals(RdfListMaterializer.RDF_NIL)) {
        return RdfListMaterializer.materializeChain(chain.rest, chains, array);
      }
      return array;
    }
  }

  /**
   * Import the given RDF stream.
   * @param {Stream} stream An RDF stream.
   * @return {Promise<void>} A promise that resolves once the stream has ended.
   * @template Q The type of quad, defaults to RDF.Quad.
   */
  public import<Q extends RDF.BaseQuad = RDF.Quad>(stream: RDF.Stream<Q>): Promise<void> {
    return new Promise((resolve, reject) => {
      stream.on('data', (quad: Q) => {
        if (quad.predicate.equals(RdfListMaterializer.RDF_FIRST)) {
          RdfListMaterializer.addChain(this.chains, quad.subject, quad.object, 'first');
        } else if (quad.predicate.equals(RdfListMaterializer.RDF_REST)) {
          RdfListMaterializer.addChain(this.chains, quad.subject, quad.object, 'rest');
        }
      });
      stream.on('error', reject);
      stream.on('end', resolve);
    });
  }

  /**
   * Get the list identified by the given starting term.
   * @param {Term} root A root RDF term that identifies an RDF list.
   * @return {Term[]} A list of terms, or undefined if the given root is not a list.
   */
  public getList(root: RDF.Term): RDF.Term[] | undefined {
    return RdfListMaterializer.materializeChain(root, this.chains);
  }

  /**
   * @return {Term[]} All available list roots.
   */
  public getRoots(): RDF.Term[] {
    return Object.keys(this.chains)
      .filter(key => this.chains[key].first && this.chains[key].rest)
      .map(key => stringToTerm(key));
  }
}
