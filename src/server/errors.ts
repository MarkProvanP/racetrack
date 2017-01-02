export class NotFoundError extends Error {
  constructor(
    private query,
    private type
  ) {
    super();
  }

  toString() {
    return `Nothing found for query: ${this.query} of type ${this.type.name}`
  }
}
