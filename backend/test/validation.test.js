import assert from 'node:assert/strict';
import { test } from 'node:test';
import { passwordField } from '../src/dto/common.dto.js';
import { createContactSchema } from '../src/dto/contact.dto.js';

test('senha fraca é rejeitada e senha forte aceita', () => {
  assert.equal(passwordField.safeParse('curta1A').success, false);
  assert.equal(passwordField.safeParse('semnumeroAAA').success, false);
  assert.equal(passwordField.safeParse('Senha@Forte1').success, true);
});

test('contato normaliza e-mail, UF e campos opcionais vazios', () => {
  const result = createContactSchema.parse({
    name: ' Maria Souza ',
    email: 'MARIA@Exemplo.com',
    phone: '(62) 99999-0000',
    company: '',
    category: 'lead',
    city: '',
    state: 'go',
  });
  assert.equal(result.name, 'Maria Souza');
  assert.equal(result.email, 'maria@exemplo.com');
  assert.equal(result.state, 'GO');
  assert.equal(result.company, null);
});

test('categoria inválida é rejeitada', () => {
  const result = createContactSchema.safeParse({
    name: 'Maria', email: 'm@e.com', phone: '62999990000', category: 'x', state: 'GO',
  });
  assert.equal(result.success, false);
});
