# Contact Hub

Aplicação web para gestão de contatos com controle de acesso baseado em papéis (**Administrador** e **Operador**), desenvolvida como case técnico para processo de estágio.

O projeto foi construído com foco em **código limpo**, **segurança robusta de autenticação**, **comunicação em tempo real sem refresh de página** e **arquitetura em camadas desacopladas**.

- **Aplicação no ar (Deploy):** [contact-hub-dpti.vercel.app](https://contact-hub-dpti.vercel.app/) *(ou seu domínio na Vercel)*
- **Documentação de Arquitetura & UML:** [docs/ARQUITETURA.md](docs/ARQUITETURA.md)
- **Stack:** Node.js 20+ · Express · PostgreSQL (Supabase) · Supabase Realtime (Broadcast) · HTML5/CSS3/JavaScript puro (ES Modules, sem bundlers pesados)

---

## Credenciais de Demonstração

O banco de dados já se encontra provisionado e semeado com dados para avaliação imediata:

| Perfil | E-mail | Senha | Permissões |
|---|---|---|---|
| **Administrador** | `admin@contacthub.local` | `Admin@12345` | Gestão de usuários, aprovação/recusa de solicitações em tempo real, visualização de contatos, notificações de novos contatos e dashboard com métricas em tempo real. |
| **Operador** | `operador@contacthub.local` | `Operador@12345` | Cadastro de contatos com disparo de eventos e consulta paginada da base de contatos. |

---

## Roteiro de Validação dos Requisitos (Tempo Real)

Para validar o fluxo em tempo real exigido na especificação em menos de 2 minutos:

1. **Aprovação de Operador sem Refresh:**
   - Em uma **janela anônima**, acesse a aplicação e clique na aba **Solicitar acesso**.
   - Preencha nome, e-mail e senha. Ao enviar, a tela entrará automaticamente no estado *"Aguardando aprovação"*. **Não atualize a página.**
   - Em outra janela normal, faça login como **Administrador** e acesse o menu **Solicitações**.
   - Clique em **Aprovar**.
   - Na janela anônima, observe a transição automática e instantânea para *"Cadastro aprovado"*. O novo usuário já pode fazer login.

2. **Cadastro de Contato com Notificação e Dashboard:**
   - Logado como **Operador**, cadastre um novo contato no menu **Contatos**.
   - Na janela do **Administrador**, observe imediatamente:
     - Notificação instantânea (*toast*) no canto superior direito.
     - Incremento no contador de **Avisos** no cabeçalho.
     - Atualização instantânea dos números e gráficos no **Dashboard**.

3. **Paginação no Backend:**
   - A lista de contatos já possui 20 registros semeados, distribuídos em **2 páginas de 10 registros**, com consulta paginada no banco via `LIMIT` e `OFFSET`.

---

## Como Executar Localmente

### Pré-requisitos
- Node.js 20 ou superior
- Git

### Passo a passo
```bash
# 1. Clone o repositório
git clone https://github.com/uservlrz/contact-hub.git
cd contact-hub

# 2. Instale as dependências
npm install

# 3. Configure o arquivo de ambiente
# Copie o arquivo de exemplo:
cp .env.example .env

# O arquivo .env já vem configurado para conexão ao banco PostgreSQL na nuvem.
# Caso queira rodar migrações ou seed novamente:
npm run migrate
npm run seed

# 4. Inicie o servidor
npm start
# ou em modo desenvolvimento com auto-reload:
npm run dev
```

Acesse a aplicação em: **`http://localhost:3000`**

### Testes Automatizados
O projeto conta com suíte de testes unitários nativa do Node.js:
```bash
npm test
```

---

## Estrutura do Projeto

A organização segue os princípios de separação de responsabilidades e código limpo, sem dependências desnecessárias:

```
contact-hub/
├── api/
│   └── index.js               # Handler serverless para execução na Vercel
├── backend/
│   ├── database/migrations/   # Migrações SQL versionadas
│   ├── scripts/               # Scripts de automação (migrate, seed)
│   ├── test/                  # Testes automatizados (Node test runner nativo)
│   └── src/
│       ├── config/            # Configurações de pool e validação com Zod
│       ├── constants/         # Enums de domínio e auditoria
│       ├── controllers/       # Recepção de requisições e respostas HTTP
│       ├── dto/               # Schemas de validação de entrada (Zod)
│       ├── middlewares/       # Autenticação, autorização (RBAC), rate limiting
│       ├── repositories/      # Único ponto de acesso ao banco (SQL parametrizado)
│       ├── routes/            # Definição e roteamento dos endpoints da API
│       ├── services/          # Regras de negócio, hashing e orquestração
│       ├── sockets/           # Emissão de sinais em tempo real (Supabase Broadcast)
│       └── utils/             # Manipuladores de erro e paginação
├── public/                    # Frontend estático entregue pela CDN
│   ├── index.html             # Ponto de entrada SPA
│   ├── vendor/                # Cliente oficial Supabase Realtime
│   └── src/
│       ├── components/        # Componentes reutilizáveis (DataTable, FormField, etc.)
│       ├── pages/             # Controladores de ciclo de vida das telas
│       ├── views/             # Renderização declarativa de DOM puro (sem innerHTML)
│       ├── services/          # Comunicação com a API e gerenciamento de sessão
│       ├── styles/            # Folhas de estilo modulares e tema visual limpo
│       └── router.js          # Roteador Hash SPA leve e resiliente
├── docs/
│   └── ARQUITETURA.md         # Diagramas UML (Casos de uso, Sequência, Entidade-Relacionamento)
├── package.json               # Dependências e scripts unificados na raiz
└── vercel.json                # Configuração de rotas e segurança na Vercel
```

---

## Segurança e Decisões de Autenticação

Como a segurança foi apontada como critério central de avaliação, as seguintes proteções foram implementadas:

| Ameaça / Vetor | Mecanismo de Mitigação Adotado |
|---|---|
| **Vazamento de credenciais no banco** | Senhas criptografadas com **bcrypt** (custo 12). Tokens de recuperação e status armazenados exclusivamente sob hash **SHA-256**. |
| **Roubo de sessão via XSS** | Access token de curta duração (**15 minutos**) mantido **exclusivamente em memória**. Refresh token persistido em cookie `httpOnly`, `SameSite=Strict` e `Secure`. |
| **Injeção de scripts (XSS)** | Frontend construído sem uso de `innerHTML` (construção declarativa via `document.createElement`), sanitização nativa do DOM e cabeçalho `Content-Security-Policy` restrito. |
| **Uso indevido de Refresh Token** | **Rotação estrita de tokens**: cada refresh token só pode ser utilizado uma única vez. Tentativas de reuso invalidam todas as sessões ativas do usuário e geram log de auditoria. |
| **Ataques de força bruta** | `express-rate-limit` aplicado nas rotas de login, solicitação de acesso e endpoints críticos da API. |
| **Enumeração de usuários** | Mensagem de erro genérica (*"Credenciais inválidas"*) combinada com hash dummy de bcrypt para garantir tempo de resposta constante e prevenir timing attacks. |
| **Injeção de SQL (SQLi)** | Todas as consultas utilizam queries preparadas e parametrizadas (`$1`, `$2`) diretamente via driver `pg`. |
| **Payloads maliciosos e DoS** | Validação de schema rigorosa com **Zod** em 100% das rotas de entrada; corpo das requisições limitado a 10 KB. |
| **Controle de Acesso Quebrado (BOLA/IDOR)** | Middleware RBAC validando permissão de papel (*Admin* vs *Operador*) no servidor em todas as rotas protegidas. |

---

## Prós e Contras das Escolhas Técnicas

| Decisão Técnica | Prós | Contras / Trade-offs |
|---|---|---|
| **Vercel + Supabase** | Escalabilidade elástica sem gerenciar servidores; banco Postgres relacional gerenciado; HTTPS e CDN globais nativos. | Arquitetura serverless não mantém conexões WebSocket persistentes diretamente (mitigado usando Supabase Broadcast). |
| **Tempo Real por Sinais** | A API publica apenas o sinal do evento (`contact:created {id}`); os dados reais são buscados via API com JWT, garantindo sigilo e RLS. | Exige um serviço broker externo para entrega de eventos push aos clientes conectados. |
| **Vanilla JS (ES Modules) no Frontend** | Zero complexidade de build (sem Webpack/Vite), inicialização instantânea no navegador, código legível e aderente aos padrões web modernos. | Criação de interfaces complexas exige mais código manual do que ecossistemas declarativos reativos (React/Vue). |
| **SQL Parametrizado Puro (`pg`)** | Máxima performance, clareza sobre quais queries rodam no banco e controle granular de transações ACID. | Ausência de ORM exige escrita e mapeamento manual de queries relacionais. |
| **JWT Curto + Refresh Token Rotativo** | Combina a statelessness do JWT com a capacidade de revogação imediata de sessões pelo banco de dados. | Requer controle de concorrência e renovação periódica em segundo plano no cliente. |

---

## Endpoints da API

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Autenticação com e-mail e senha; emite access token e refresh cookie |
| `POST` | `/api/auth/refresh` | Público (via cookie) | Rotação e renovação do access token |
| `POST` | `/api/auth/logout` | Público | Invalidação do refresh token ativo |
| `GET` | `/api/auth/me` | Autenticado | Dados do perfil do usuário em sessão |
| `POST` | `/api/registrations` | Público | Solicitação inicial de acesso de operador |
| `POST` | `/api/registrations/status` | Público (com token) | Consulta pontual de status da solicitação |
| `GET` | `/api/registrations` | Administrador | Listagem de solicitações pendentes e histórico |
| `POST` | `/api/registrations/:id/approve` | Administrador | Aprovação de acesso e criação da conta |
| `POST` | `/api/registrations/:id/reject` | Administrador | Recusa de solicitação de acesso |
| `GET` | `/api/users` | Administrador | Listagem de usuários do sistema |
| `POST` | `/api/users` | Administrador | Cadastro manual de novos usuários |
| `GET` | `/api/contacts` | Autenticado | Listagem paginada de contatos (`page`, `limit`, `search`) |
| `POST` | `/api/contacts` | Operador | Cadastro de novo contato e disparo de eventos |
| `GET` | `/api/admin/dashboard` | Administrador | Métricas agregadas e dimensões em tempo real |
| `GET` | `/api/admin/activity` | Administrador | Trilha de auditoria das ações críticas |/
