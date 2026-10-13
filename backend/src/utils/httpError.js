export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Requisição inválida', details) {
    return new HttpError(400, message, details);
  }

  static unauthorized(message = 'Não autenticado') {
    return new HttpError(401, message);
  }

  static forbidden(message = 'Acesso negado') {
    return new HttpError(403, message);
  }

  static notFound(message = 'Recurso não encontrado') {
    return new HttpError(404, message);
  }

  static conflict(message) {
    return new HttpError(409, message);
  }
}
