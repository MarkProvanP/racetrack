export class NoSuchUserError extends Error {
  constructor(private username);
}
