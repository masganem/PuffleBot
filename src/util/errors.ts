/**
 There was an attempt to perform an action on an object that was not defined.
 */
class NotFoundError extends Error {
  constructor(msg : string) {
    super(msg);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 Input given to a function was invalid or insufficient for an attempted action.
 */
class BadParamError extends Error {
  constructor(msg : string) {
    super(msg);
    Object.setPrototypeOf(this, BadParamError.prototype);
  }
}

/**
 * Maps error types to their matching HTTP response status code.
 * @param {Error} err - Error thrown.
 * @return {number} The HTTP status code corresponding to the given error type.
 */
function errorStatus(err : Error) : number {
  if (err instanceof NotFoundError) return 404;
  if (err instanceof BadParamError) return 400;
  return 500;
}

export {NotFoundError, BadParamError, errorStatus};
