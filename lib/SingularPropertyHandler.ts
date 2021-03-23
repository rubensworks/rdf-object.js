/**
 * A proxy handler for exposing array-valued hashes
 * as hashes with singular values.
 * This proxy will always take the first element of array values.
 */
export class SingularPropertyHandler<T> implements ProxyHandler<Record<string, T[]>> {
  public has(target: Record<string, T[]>, propertyKey: string | symbol): boolean {
    return !!this.get(target, propertyKey);
  }

  public get(target: Record<string, T[]>, propertyKey: string | symbol): T | undefined {
    const value = target[<string> propertyKey];
    return value && value.length > 0 ? value[0] : undefined;
  }

  public set(target: Record<string, T[]>, propertyKey: string | symbol, value: any): boolean {
    target[<string> propertyKey] = [ value ];
    return true;
  }

  public ownKeys(target: Record<string, T[]>): (string | symbol)[] {
    return Object.keys(target).filter(key => this.has(target, key));
  }

  public deleteProperty(target: Record<string, T[]>, propertyKey: string | symbol): boolean {
    target[<string> propertyKey] = [];
    return true;
  }
}
