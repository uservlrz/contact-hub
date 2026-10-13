-- Esquema inicial do Contact Hub (PostgreSQL 13+)

CREATE TYPE user_role AS ENUM ('admin', 'operator');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE contact_category AS ENUM ('lead', 'client', 'partner');

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          varchar(100) NOT NULL,
  email         varchar(254) NOT NULL,
  password_hash varchar(100) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'operator',
  active        boolean      NOT NULL DEFAULT true,
  created_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_key ON users (email);

CREATE TABLE registration_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              varchar(100) NOT NULL,
  email             varchar(254) NOT NULL,
  password_hash     varchar(100) NOT NULL,
  status_token_hash char(64)     NOT NULL,
  status            registration_status NOT NULL DEFAULT 'pending',
  reviewed_by       uuid REFERENCES users (id) ON DELETE SET NULL,
  reviewed_at       timestamptz,
  created_at        timestamptz  NOT NULL DEFAULT now()
);
-- Impede duas solicitacoes pendentes para o mesmo e-mail (inclusive em corrida).
CREATE UNIQUE INDEX registration_requests_pending_email_key
  ON registration_requests (email) WHERE status = 'pending';
CREATE INDEX registration_requests_status_idx
  ON registration_requests (status, created_at DESC);

CREATE TABLE contacts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar(100) NOT NULL,
  email      varchar(254) NOT NULL,
  phone      varchar(20)  NOT NULL,
  company    varchar(100),
  category   contact_category NOT NULL,
  city       varchar(100),
  state      char(2)      NOT NULL,
  created_by uuid         NOT NULL REFERENCES users (id),
  created_at timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX contacts_created_at_idx ON contacts (created_at DESC, id);
CREATE INDEX contacts_created_by_idx ON contacts (created_by);

CREATE TABLE refresh_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash char(64)    NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);

CREATE TABLE audit_logs (
  id         bigserial PRIMARY KEY,
  actor_id   uuid REFERENCES users (id) ON DELETE SET NULL,
  action     varchar(60) NOT NULL,
  entity     varchar(40),
  entity_id  varchar(64),
  metadata   jsonb       NOT NULL DEFAULT '{}'::jsonb,
  ip         varchar(45),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at DESC);

-- Supabase expoe o schema public via API (PostgREST) com a chave anon.
-- RLS ligado e sem policies = anon/authenticated nao leem nada; a API usa a role postgres (ignora RLS).
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

