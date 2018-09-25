import {IJsonLdContextNormalized} from "jsonld-context-parser";
import * as RDF from "rdf-js";
import {termToString} from "rdf-string";
import {ShortcutPropertyHandler} from "./ShortcutPropertyHandler";
import {SingularPropertyHandler} from "./SingularPropertyHandler";

/**
 * A resource is identified by a URI and has property links to other resources.
 */
export class Resource {

  public readonly term: RDF.Term;
  public readonly predicates: Resource[];
  public readonly propertiesUri: {[predicate: string]: Resource[]};
  public readonly properties: {[shortcut: string]: Resource[]};
  public readonly property: {[shortcut: string]: Resource};
  public list: Resource[];

  constructor(args: IResourceArgs) {
    this.term = args.term;

    this.predicates = [];
    this.propertiesUri = {};
    this.properties = new Proxy(this.propertiesUri, new ShortcutPropertyHandler(args.context || {}));
    this.property = <any> new Proxy(this.properties, new SingularPropertyHandler());
  }

  /**
   * Get the term type of this resource.
   * @return {"NamedNode" | "BlankNode" | "Literal" | "Variable" | "DefaultGraph"}
   */
  get type() {
    return this.term.termType;
  }

  /**
   * @return {string} The URI, blank node label, literal value or variable name of this resource.
   */
  get value() {
    return this.term.value;
  }

  /**
   * Check if this resource is of the given type.
   *
   * This will be true if at least one of the following conditions is true.
   * 1. This resource equals `type`.
   * 2. This resource has the rdf:type `type`.
   * 3. This resource is a subclass of `type`.
   * 4. This resource is a subtype or subclass of a resource that is of the given type.
   *
   * @param {Term} type An RDF term.
   * @return {boolean} If this resource is of the given type.
   */
  public isA(type: RDF.Term): boolean {
    if (type.equals(this.term)) {
      return true;
    }
    return (this.propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] || [])
      .concat(this.propertiesUri['http://www.w3.org/1999/02/22-rdf-syntax-ns#subClassOf'] || [])
      .reduce((acc: boolean, superType: Resource) => acc || superType.isA(type), false);
  }

  /**
   * Add a property to the given resource.
   * @param {Resource} predicate Predicate resource of the property link.
   * @param {Resource} object Object resource of the property link.
   */
  public addProperty(predicate: Resource, object: Resource) {
    const propertyUri: string = termToString(predicate.term);
    let properties: Resource[] = this.propertiesUri[propertyUri];
    if (!properties) {
      this.propertiesUri[propertyUri] = properties = [];
    }
    properties.push(object);
    this.predicates.push(predicate);
  }

  /**
   * @return {string} The string representation of a Resource
   */
  public toString(): string {
    return this.value;
  }

}

export interface IResourceArgs {
  term: RDF.Term;
  context?: IJsonLdContextNormalized;
}
