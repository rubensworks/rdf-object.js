/**
 * A proxy handler for exposing array-valued hashes
 * as hashes with singular values.
 * This proxy will always take the first element of array values.
 */
export class SingularPropertyHandler<T> implements ProxyHandler<{[predicate: string]: T[]}> {

  public has(target: {[predicate: string]: T[]}, p: PropertyKey): boolean {
    return !!this.get(target, p);
  }

  public get(target: {[predicate: string]: T[]}, p: PropertyKey): T {
    const value = target[<string> p];
    return value && value.length > 0 ? value[0] : null;
  }

  public set(target: {[predicate: string]: T[]}, p: PropertyKey, value: any): boolean {
    target[<string> p] = [value];
    return true;
  }

  public ownKeys(target: {[predicate: string]: T[]}): PropertyKey[] {
    return Object.keys(target).filter((key) => this.has(target, key));
  }

}
