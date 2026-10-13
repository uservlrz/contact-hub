import { HttpError } from '../utils/httpError.js';

const PG_UNIQUE_VIOLATION = '23505';

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message, details: error.details });
  }
  if (error.code === PG_UNIQUE_VIOLATION) {
    return res.status(409).json({ message: 'Registro já existente' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Corpo da requisição muito grande' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Erro interno do servidor' });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Rota não encontrada' });
}
