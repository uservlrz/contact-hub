import { HttpError } from '../utils/httpError.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(HttpError.badRequest('Dados inválidos', details));
  }
  req[source] = result.data;
  return next();
};
