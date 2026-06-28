/**
 * PATRÓN DE DISEÑO: Specification
 * --------------------------------------------------------------------------
 * Encapsula una regla de negocio booleana en un objeto reutilizable y
 * componible. En lugar de escribir condiciones pegadas dentro de un `filter`
 * (`e.activo && e.nivel_recomendado === nivel`), cada condición se vuelve una
 * clase con una sola responsabilidad (SRP) que se puede combinar con
 * `.and()`, `.or()` y `.not()` sin modificar el código existente (OCP).
 *
 * Beneficio: agregar un nuevo criterio de filtrado = crear una clase nueva.
 * Nunca se toca el motor ni las specs ya escritas.
 */

/** Abstracción de la que dependen los consumidores (DIP). */
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

/**
 * Base que aporta la capacidad de composición. Las specs concretas solo
 * implementan `isSatisfiedBy`; la combinación la heredan gratis.
 */
export abstract class CompositeSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends CompositeSpecification<T> {
  private readonly left: Specification<T>;
  private readonly right: Specification<T>;
  constructor(left: Specification<T>, right: Specification<T>) {
    super();
    this.left = left;
    this.right = right;
  }
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends CompositeSpecification<T> {
  private readonly left: Specification<T>;
  private readonly right: Specification<T>;
  constructor(left: Specification<T>, right: Specification<T>) {
    super();
    this.left = left;
    this.right = right;
  }
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends CompositeSpecification<T> {
  private readonly spec: Specification<T>;
  constructor(spec: Specification<T>) {
    super();
    this.spec = spec;
  }
  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
