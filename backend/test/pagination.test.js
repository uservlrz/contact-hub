import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildMeta, toOffset } from '../src/utils/pagination.js';

test('toOffset calcula o deslocamento da página', () => {
  assert.equal(toOffset({ page: 1, limit: 10 }), 0);
  assert.equal(toOffset({ page: 3, limit: 10 }), 20);
});

test('buildMeta calcula o total de páginas', () => {
  assert.deepEqual(buildMeta({ page: 1, limit: 10, total: 20 }), {
    page: 1,
    limit: 10,
    total: 20,
    totalPages: 2,
  });
  assert.equal(buildMeta({ page: 1, limit: 10, total: 21 }).totalPages, 3);
  assert.equal(buildMeta({ page: 1, limit: 10, total: 0 }).totalPages, 1);
});
