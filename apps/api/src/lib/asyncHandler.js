// Wrap async route handlers so thrown errors (incl. ZodError) reach the error middleware.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
