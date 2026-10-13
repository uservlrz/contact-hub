# Contact Hub — Análise de requisitos e System Design

Diagramas em [Mermaid](https://mermaid.js.org/) (renderizam no GitHub, VS Code e na maioria dos visualizadores de Markdown).

## 1. Requisitos

### 1.1 Funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF01 | Autenticação por e-mail e senha (tela de login) | Obrigatório |
| RF02 | Operador sem conta envia solicitação de cadastro pela tela de login | Obrigatório |
| RF03 | Operador aguarda a decisão do admin **em tempo real**, sem recarregar a tela | Obrigatório |
| RF04 | Admin recebe solicitações, aprova ou rejeita | Obrigatório |
| RF05 | Admin cadastra usuários diretamente e ativa/desativa contas | Obrigatório |
| RF06 | Operador cadastra contatos | Obrigatório |
| RF07 | Cada contato cadastrado gera notificação em tempo real ao admin | Obrigatório |
| RF08 | Admin e operador listam contatos, com **paginação no backend** | Obrigatório |
| RF09 | Admin consulta a atividade da aplicação (trilha de auditoria) | Obrigatório |
| RF10 | Dashboard do admin com métricas e dimensões, atualizado em tempo real | Extra |
| RF11 | Deploy reproduzível (Docker) | Extra |

### 1.2 Não funcionais

| ID | Requisito | Como é atendido |
|----|-----------|-----------------|
| RNF01 | Segurança de autenticação | JWT de acesso curto + refresh token rotativo (ver README) |
| RNF02 | Manutenibilidade | Camadas `routes → controllers → services → repositories`, DTOs validados, sem dependências desnecessárias |
| RNF03 | Escalabilidade | API stateless em serverless (Vercel); tempo real delegado ao Supabase Realtime |
| RNF04 | Auditabilidade | Tabela `audit_logs` para eventos de segurança e negócio |
| RNF05 | Portabilidade | Node 20+, PostgreSQL 13+, Docker opcional |

### 1.3 Premissas e decisões negociáveis

- Operador pode listar **todos** os contatos (a especificação pede lista para ambos os perfis). Se for necessário isolar por operador, basta filtrar por `created_by` no `contactRepository`.
- Um e-mail já cadastrado devolve `409` na solicitação. Isso permite enumerar e-mails; troca consciente por usabilidade (mitigada por rate limit de 5/hora por IP).
- Apenas o perfil **operador** cria contatos (o admin analisa).

## 2. Casos de uso

```mermaid
flowchart LR
    Visitante([Visitante / futuro operador])
    Operador([Operador])
    Admin([Administrador])

    subgraph Contact Hub
        UC1(Entrar)
        UC2(Solicitar cadastro)
        UC3(Aguardar aprovação em tempo real)
        UC4(Cadastrar contato)
        UC5(Listar contatos paginados)
        UC6(Aprovar / rejeitar solicitação)
        UC7(Gerenciar usuários)
        UC8(Receber notificações em tempo real)
        UC9(Consultar dashboard)
        UC10(Consultar atividade)
    end

    Visitante --> UC2
    Visitante --> UC3
    Operador --> UC1
    Operador --> UC4
    Operador --> UC5
    Admin --> UC1
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
```

## 3. Arquitetura

```mermaid
    subgraph Vercel ["Vercel (Serverless)"]
        SPA["SPA Frontend (Static)<br/>HTML · CSS · ES Modules"]
        API["Express API (Serverless Function)<br/>Middlewares · Controllers · Services · Repositories"]
    end

    subgraph Supabase ["Supabase (PaaS)"]
        DB[("PostgreSQL 15+<br/>(Supabase Studio Web)")]
        RT["Supabase Realtime (Broadcast)<br/>canais isolados por segredo"]
    end

    SPA -- "HTTPS /api (Bearer JWT)" --> API
    API -- "TCP (pooler 6543)" --> DB
    API -- "POST /broadcast" --> RT
    SPA -- "WSS (WebSocket)" --> RT
```

## 4. Modelo de dados

```mermaid
erDiagram
    USERS ||--o{ CONTACTS : "cadastra (created_by)"
    USERS ||--o{ REFRESH_TOKENS : possui
    USERS ||--o{ AUDIT_LOGS : "executa (actor_id)"
    USERS ||--o{ REGISTRATION_REQUESTS : "analisa (reviewed_by)"

    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash "bcrypt"
        enum role "admin | operator"
        boolean active
        timestamptz created_at
    }
    REGISTRATION_REQUESTS {
        uuid id PK
        varchar name
        varchar email "unico enquanto pending"
        varchar password_hash
        char status_token_hash "sha256"
        enum status "pending | approved | rejected"
        uuid reviewed_by FK
        timestamptz reviewed_at
    }
    CONTACTS {
        uuid id PK
        varchar name
        varchar email
        varchar phone
        varchar company
        enum category "lead | client | partner"
        varchar city
        char state
        uuid created_by FK
        timestamptz created_at
    }
    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        char token_hash UK "sha256"
        timestamptz expires_at
        timestamptz revoked_at
    }
    AUDIT_LOGS {
        bigserial id PK
        uuid actor_id FK
        varchar action
        varchar entity
        varchar entity_id
        jsonb metadata
        varchar ip
        timestamptz created_at
    }
```

## 5. Sequências

### 5.1 Login e renovação de sessão

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as Frontend
    participant A as API
    participant D as PostgreSQL

    U->>F: e-mail + senha
    F->>A: POST /api/auth/login
    A->>D: busca usuário por e-mail
    A->>A: bcrypt.compare (hash dummy se não existir)
    A->>D: grava refresh token (somente o hash) + auditoria
    A-->>F: accessToken (15 min) no corpo + refresh token em cookie httpOnly
    F->>F: guarda accessToken só em memória

    Note over F,A: access token expirou
    F->>A: request → 401
    F->>A: POST /api/auth/refresh (cookie)
    A->>D: revoga token atual (atômico) e emite novo par
    A-->>F: novo accessToken + novo cookie
    F->>A: repete o request original
```

### 5.2 Solicitação de cadastro com aprovação em tempo real

```mermaid
sequenceDiagram
    actor O as Operador
    actor M as Admin
    participant F as Frontend
    participant A as API
    participant S as Supabase Realtime
    participant D as PostgreSQL

    O->>F: preenche formulário na tela de login
    F->>A: POST /api/registrations
    A->>D: grava solicitação (senha já em hash, status pending)
    A->>S: emite registration:created para sala admins
    S-->>M: notificação "nova solicitação"
    A-->>F: 202 { id, statusToken }
    F->>S: assina canal derivado do hash do statusToken
    S-->>F: registration:status { pending }

    M->>A: POST /api/registrations/:id/approve
    A->>D: transação: pending→approved + cria usuário + auditoria
    A->>S: emite registration:status { approved }
    S-->>F: tela muda para "aprovado" sem recarregar
```

### 5.3 Cadastro de contato e notificação ao admin

```mermaid
sequenceDiagram
    actor O as Operador
    actor M as Admin
    participant A as API
    participant S as Supabase Realtime
    participant D as PostgreSQL

    O->>A: POST /api/contacts (Bearer JWT, papel operator)
    A->>A: valida DTO
    A->>D: INSERT contato + auditoria
    A->>S: contact:created e dashboard:changed (sala admins)
    S-->>M: toast + sino de notificações
    S-->>M: dashboard recarrega as métricas
    A-->>O: 201 contato criado
```

## 6. Estrutura de camadas (backend)

```mermaid
classDiagram
    class Routes
    class Controllers
    class Services
    class Repositories
    class Realtime
    class Middlewares

    Routes --> Middlewares : authenticate / authorize / validate
    Routes --> Controllers
    Controllers --> Services : sem regra de negócio
    Services --> Repositories : persistência
    Services --> Realtime : eventos
    Repositories --> PostgreSQL
```

Regras de dependência: cada camada só conhece a imediatamente abaixo; SQL só existe em `repositories/`; regras de negócio só em `services/`.

