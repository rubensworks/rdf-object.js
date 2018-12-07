import {ContextParser, IJsonLdContextNormalized} from "jsonld-context-parser";

/**
 * A proxy handler for exposing a URI-to-? map to shortcut-to-? map
 * based on a JSON-LD context.
 */
export class ShortcutPropertyHandler<T> implements ProxyHandler<{[predicate: string]: T[]}> {

  private readonly context: IJsonLdContextNormalized;

  constructor(context: IJsonLdContextNormalized) {
    this.context = context;
  }

  public has(target: {[predicate: string]: T[]}, p: PropertyKey): boolean {
    return this.get(target, p).length > 0;
  }

  public get(target: {[predicate: string]: T[]}, p: PropertyKey): T[] {
    return target[ContextParser.expandTerm(this.toTermString(p), this.context, true)] || [];
  }

  public set(target: {[predicate: string]: T[]}, p: PropertyKey, value: any): boolean {
    target[ContextParser.expandTerm(this.toTermString(p), this.context, true)] = value;
    return true;
  }

  public ownKeys(target: {[predicate: string]: T[]}): PropertyKey[] {
    return Object.keys(target)
      .map((key: string) => ContextParser.expandTerm(key, this.context, true))
      .filter((key) => this.has(target, key));
  }

  private toTermString(p: PropertyKey) {
    return typeof p === 'string' ? p : String(p);
  }

}
