# Contact Hub

Aplicação web para cadastro de contatos com dois perfis — **administrador** e **operador** — desenvolvida como case técnico. Foco: autenticação segura, tempo real e código limpo.

- **Hospedagem:** Vercel (frontend estático + API como função serverless)
- **Banco:** PostgreSQL gerenciado no Supabase (visualização e gestão via Supabase Studio Web)
- **Tempo real:** Supabase Realtime (Broadcast)
- **Backend:** Node.js 20+ · Express · `pg` · JWT · zod · **Frontend:** JavaScript, HTML e CSS puros (sem build)
- Requisitos e UML: [docs/ARQUITETURA.md](docs/ARQUITETURA.md)

## Funcionalidades

| Perfil | O que faz |
|--------|-----------|
| Visitante | Solicita cadastro na tela de login e **aguarda a aprovação em tempo real**, sem recarregar |
| Operador | Cadastra contatos e consulta a lista paginada |
| Administrador | Aprova/rejeita solicitações, gerencia usuários, recebe **notificação em tempo real** a cada contato, vê lista paginada, atividade e **dashboard** (tempo real) |

## Passo a passo: do zero ao ar (≈ 10 min)

### 1. Supabase (banco + tempo real + interface visual)
1. Crie uma conta em <https://supabase.com> → **New project** (anote a senha do banco).
2. **Project Settings → API**: copie `Project URL` (→ `SUPABASE_URL`) e a chave `anon public` (→ `SUPABASE_ANON_KEY`).
3. Clique em **Connect** (topo) → **Transaction pooler** → copie a string (porta **6543**) e troque `[YOUR-PASSWORD]` (→ `DATABASE_URL`).
4. **Supabase Studio:** Todas as tabelas e dados podem ser consultados e editados diretamente no navegador através do menu **Table Editor** do Supabase, dispensando a instalação de clientes pesados como pgAdmin.

### 2. Rodar localmente (cria as tabelas e os dados)
```bash
cd backend
npm install
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
# edite o .env: DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY e um JWT_ACCESS_SECRET próprio
npm run migrate          # cria tabelas (com RLS ligado)
npm run seed             # admin, operador demo e 20 contatos (2 páginas)
npm start                # http://localhost:3000
```
Gerar o segredo JWT: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

O migrate/seed é executado **uma vez, da sua máquina**, apontando para o banco do Supabase — o mesmo banco usado pela Vercel.

### 3. Deploy na Vercel
1. Suba a pasta `contact-hub` para um repositório no GitHub (`.env` já está no `.gitignore`).
2. Em <https://vercel.com> → **Add New → Project** → importe o repositório. **Framework Preset: Other**; deixe Build Command em branco. O `vercel.json` já define a pasta estática e a rota da API.
3. Em **Settings → Environment Variables**, cadastre:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | string do Transaction pooler (porta 6543) |
| `DATABASE_SSL` | `true` |
| `DATABASE_POOL_MAX` | `1` |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | chave anon public |
| `JWT_ACCESS_SECRET` | segredo aleatório (≥ 32 caracteres) |
| `TRUST_PROXY` | `1` |

4. **Deploy**. Abra a URL gerada e entre com o admin do seed.

Via CLI (alternativa): `npm i -g vercel && vercel --prod` na raiz do projeto.

### 4. Roteiro de demonstração do tempo real
1. Janela anônima A: em *Solicitar acesso*, preencha o formulário → fica em "Aguardando aprovação".
2. Janela B: entre como admin → *Solicitações* → **Aprovar**.
3. A janela A muda sozinha para "Cadastro aprovado". Entre com o novo usuário.
4. Como operador, cadastre um contato: o admin recebe toast + sino e o dashboard atualiza.

Credenciais do seed (definidas no `.env`): `admin@contacthub.local` / `Admin@12345` e `operador@contacthub.local` / `Operador@12345`. **Troque-as em produção.**

### Testes
```bash
cd backend && npm test
```

## Estrutura

```
contact-hub/
├── api/index.js               # entrada serverless da Vercel
├── vercel.json · package.json # deploy (workspace raiz)
├── backend/
│   ├── database/migrations/   # SQL versionado
│   ├── scripts/               # migrate.js, seed.js
│   ├── test/
│   └── src/
│       ├── config/ constants/ routes/ controllers/ services/
│       ├── repositories/      # único lugar com SQL
│       ├── middlewares/ dto/ sockets/(realtime) utils/
├── frontend/
│   ├── index.html · vendor/supabase.js
│   └── src/ components/ pages/ views/ services/ models/ styles/
└── docs/ARQUITETURA.md
```
Espelha `puc-cursos-backend` (camadas) e `puc-cursos-plataforma` (components/pages/views/services/models).

## Como o tempo real funciona com segurança

A Vercel não mantém WebSocket, então a API publica **sinais** no Supabase Realtime e o navegador assina:
- Eventos **não carregam dados** (ex.: `contact:created {id}`); o admin busca os detalhes via API com JWT.
- **Canal do admin:** nome derivado por HMAC do segredo JWT, entregue só a admins autenticados.
- **Canal do solicitante:** derivado do hash de um token aleatório que só ele recebe; ao conectar, consulta o estado atual (`POST /api/registrations/status`) para não perder uma decisão anterior.
- **RLS ligado** em todas as tabelas, sem policies: a chave `anon`, que é pública, **não lê nada** pela API REST do Supabase. Só o backend (role `postgres`) acessa os dados.

## Segurança (decisões de login)

| Ameaça | Mitigação |
|--------|-----------|
| Vazamento do banco | Senhas com **bcrypt** (custo 12); refresh tokens e tokens de status guardados só como **SHA-256**; RLS |
| Roubo de token por XSS | Access token **só em memória**; refresh token em cookie **httpOnly + SameSite=Strict + Secure + path `/api/auth`**; UI sem `innerHTML`; **CSP** sem inline |
| Token de acesso vazado | Vida curta (**15 min**), HS256 fixado, `iss`/`exp` validados |
| Refresh token roubado | **Rotação** a cada uso; reuso **revoga todas as sessões** e é auditado |
| Força bruta | Rate limit no login, cadastro e API (ver limitação abaixo) |
| Enumeração de usuários | Mensagem única + bcrypt com hash dummy (tempo constante) |
| CSRF | `SameSite=Strict`; API usa Bearer; sem CORS |
| Escalada de privilégio | RBAC no servidor em toda rota |
| SQL injection | Somente consultas parametrizadas |
| Entrada maliciosa | zod em toda entrada; corpo ≤ 10 KB; senha ≤ 72 bytes |
| Conta desligada | Desativar revoga refresh tokens |
| Configuração | Falha na inicialização se o segredo JWT tiver < 32 caracteres |

**Limitações conhecidas:** o rate limit usa memória por instância serverless (em produção, usar Upstash Redis ou similar); 2FA para admin; revalidar `active` a cada request (hoje até 15 min); abrir várias abas pode disparar a detecção de reuso do refresh token.

## Prós e contras das escolhas

| Escolha | Prós | Contras |
|---------|------|---------|
| Vercel + Supabase | Deploy grátis e simples, HTTPS e domínio prontos, Postgres gerenciado | Sem WebSocket na Vercel → Realtime externo; cold start na API |
| Supabase Realtime por sinais | Funciona em serverless; payload sem dados sensíveis | Mais um serviço; segurança depende do sigilo do nome do canal |
| Express + JS puro | Zero build, poucas dependências | Sem tipagem; UI mais manual que React/Vue |
| SQL puro (`pg`) | Controle total e queries simples | Mapeamento e migrações manuais |
| JWT curto + refresh rotativo | API stateless, revogável | Mais complexo que sessão por cookie |
| Low-code/no-code (descartado) | Rápido | Pouco controle sobre autenticação, o critério central |

## API (resumo)

| Método | Rota | Acesso |
|--------|------|--------|
| POST | `/api/auth/login` · `/refresh` · `/logout` | público (cookie no refresh/logout) |
| GET | `/api/auth/me` · `/api/config` · `/api/health` | autenticado / público / público |
| POST | `/api/registrations` · `/api/registrations/status` | público |
| GET | `/api/registrations?status=` | admin |
| POST | `/api/registrations/:id/approve` · `/reject` | admin |
| GET/POST | `/api/users` · PATCH `/api/users/:id/status` | admin |
| GET | `/api/contacts?page=&limit=&search=` · `/api/contacts/:id` | admin, operador |
| POST | `/api/contacts` | operador |
| GET | `/api/admin/dashboard` · `/api/admin/activity` | admin |
