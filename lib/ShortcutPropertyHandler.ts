import type { JsonLdContextNormalized } from 'jsonld-context-parser';

/**
 * A proxy handler for exposing a URI-to-? map to shortcut-to-? map
 * based on a JSON-LD context.
 */
export class ShortcutPropertyHandler<T> implements ProxyHandler<Record<string, T[]>> {
  private readonly context: JsonLdContextNormalized;

  public constructor(context: JsonLdContextNormalized) {
    this.context = context;
  }

  public has(target: Record<string, T[]>, propertyKey: string | symbol): boolean {
    return this.get(target, propertyKey).length > 0;
  }

  public get(target: Record<string, T[]>, propertyKey: string | symbol): T[] {
    const iri = this.context.expandTerm(this.toTermString(propertyKey), true);
    if (!iri) {
      throw new Error(`Illegal property getting for disabled context key '${this.toTermString(propertyKey)}'`);
    }
    if (!(iri in target)) {
      target[iri] = [];
    }
    return target[iri];
  }

  public set(target: Record<string, T[]>, propertyKey: string | symbol, value: any): boolean {
    const iri = this.context.expandTerm(this.toTermString(propertyKey), true);
    if (!iri) {
      throw new Error(`Illegal property setting for disabled context key '${this.toTermString(propertyKey)}'`);
    }
    target[iri] = value;
    return true;
  }

  public ownKeys(target: Record<string, T[]>): (string | symbol)[] {
    return <string[]> Object.keys(target)
      .map((key: string) => this.context.expandTerm(key, true))
      .filter(key => key && this.has(target, key));
  }

  private toTermString(propertyKey: string | symbol): string {
    return typeof propertyKey === 'string' ? propertyKey : String(propertyKey);
  }
}
