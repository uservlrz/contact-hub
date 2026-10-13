/** Encaminha rejeições de handlers assíncronos para o middleware de erro. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
