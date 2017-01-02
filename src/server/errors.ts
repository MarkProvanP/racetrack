export class NotFoundError extends Error {
  constructor(
    private query
  ) {
    super();
  }

  toString() {
    return `Nothing found for query: ${this.query}`
  }
}
