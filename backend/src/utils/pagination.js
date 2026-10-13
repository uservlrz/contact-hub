export function toOffset({ page, limit }) {
  return (page - 1) * limit;
}

export function buildMeta({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export function paginate({ page, limit, total, data }) {
  return { data, meta: buildMeta({ page, limit, total }) };
}
