# 💰 FinTrack Pro

> Ecossistema de gestão financeira construído com arquitetura de **Microsserviços** — focado em alta escalabilidade, consistência de dados e desacoplamento. Simula um ambiente de fintech onde transações, saldos e notificações são processados de forma distribuída.

---

## 🏗️ Arquitetura

O projeto adota uma estratégia de **Monorepo** para gerenciar o ciclo de vida de múltiplos serviços e pacotes compartilhados, garantindo tipagem única e reuso de lógica de negócio.

| Componente | Descrição |
|---|---|
| **Front-end** | React + Vite com TanStack Router — performance e tipagem forte em todas as rotas |
| **API Gateway (BFF)** | Serviço Fastify como ponto único de entrada, orquestrando chamadas internas |
| **Wallet Service** | Gestão de contas e saldos com PostgreSQL + Drizzle ORM |
| **Transaction Service** | Gerencia entradas e saídas, implementando Event Sourcing básico |
| **Message Broker** | Apache Kafka para comunicação assíncrona entre serviços |

---

## 🛠️ Stack

**Core**

- **Linguagem:** TypeScript (Node.js)
- **Back-end:** Fastify
- **Front-end:** React, Vite, TanStack Router/Query, Tailwind CSS
- **Banco de Dados:** PostgreSQL
- **ORM:** Drizzle (type-safe SQL)

**Infraestrutura**

- **Mensageria:** Apache Kafka
- **Monorepo:** Pnpm Workspaces + Turborepo
- **Containers:** Docker & Docker Compose

---

## 📐 Decisões de Design

- **Shared Packages** — Regras de negócio financeiras e contratos Kafka isolados em `/packages`, evitando duplicação entre `wallet-service` e `transaction-service`.
- **Desacoplamento via Kafka** — O serviço de transações não conhece o de notificações. Novas funcionalidades (cashback, auditoria) são adicionadas apenas "ouvindo" tópicos, sem alterar código existente.
- **BFF Pattern** — O Gateway centraliza autenticação e simplifica o consumo para clientes Web/Mobile, ocultando a complexidade da rede interna.

---

## 🚀 Getting Started

**Pré-requisitos**

- Docker & Docker Compose
- Node.js v20+
- Pnpm

**Passo a passo**

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/fintrack-pro.git
cd fintrack-pro

# 2. Instalar dependências
pnpm install

# 3. Subir a infraestrutura (DB & Kafka)
docker-compose up -d

# 4. Rodar em modo desenvolvimento
pnpm dev
```

---

## 📈 Roadmap

## ☁️ Deploy (Heroku + Vercel + GitHub Actions)

### 1) Criar apps no Heroku

```bash
heroku create fintrack-api-gateway
heroku create fintrack-transaction-service
```

### 2) Provisionar PostgreSQL (Heroku Postgres)

```bash
heroku addons:create heroku-postgresql:essential-0 --app fintrack-api-gateway
```

Depois, copie a `DATABASE_URL` gerada no app `fintrack-api-gateway` e replique no `fintrack-transaction-service` caso os dois serviços usem o mesmo banco:

```bash
heroku config:set DATABASE_URL="<DATABASE_URL_DO_API_GATEWAY>" --app fintrack-transaction-service
```

Opcao sem custo de Postgres no Heroku: use Neon (ou outro Postgres externo) e configure a mesma URL nos dois apps:

```bash
heroku config:set DATABASE_URL="<NEON_DATABASE_URL>" --app fintrack-api-gateway
heroku config:set DATABASE_URL="<NEON_DATABASE_URL>" --app fintrack-transaction-service
```

No script automatizado, voce pode passar a URL externa direto na execucao:

```bash
env NEON_DATABASE_URL="<NEON_DATABASE_URL>" fish ./script.sh
```

### 3) Provisionar Kafka

No Heroku, primeiro descubra quais servicos e planos Kafka estao disponiveis para sua conta/regiao:

```bash
heroku addons:services | rg -i kafka
heroku addons:plans heroku-kafka
heroku addons:plans kafkacluster
```

Depois, crie o add-on com um plano valido no `fintrack-api-gateway` (exemplo com placeholder):

```bash
heroku addons:create kafkacluster:test --app fintrack-api-gateway
# ou (pago)
heroku addons:create heroku-kafka:basic-0 --app fintrack-api-gateway
```

Se seu provedor de Kafka nao expuser variaveis `KAFKA_*` automaticamente, configure manualmente nos dois apps:

Se o add-on não injetar automaticamente as chaves esperadas, configure manualmente:

```bash
heroku config:set KAFKA_BROKERS="<HOST:PORT>" --app fintrack-api-gateway
heroku config:set KAFKA_BROKERS="<HOST:PORT>" --app fintrack-transaction-service

heroku config:set KAFKA_SSL=true --app fintrack-api-gateway
heroku config:set KAFKA_SSL=true --app fintrack-transaction-service

heroku config:set KAFKA_SASL_USERNAME="<USERNAME>" --app fintrack-api-gateway
heroku config:set KAFKA_SASL_PASSWORD="<PASSWORD>" --app fintrack-api-gateway
heroku config:set KAFKA_SASL_USERNAME="<USERNAME>" --app fintrack-transaction-service
heroku config:set KAFKA_SASL_PASSWORD="<PASSWORD>" --app fintrack-transaction-service
```

### 4) Configurar variáveis do API Gateway no Heroku

```bash
heroku config:set NODE_ENV=production --app fintrack-api-gateway
heroku config:set JWT_SECRET="<SEGREDO_COM_32+_CARACTERES>" --app fintrack-api-gateway
heroku config:set CORS_ORIGIN="https://<seu-projeto>.vercel.app" --app fintrack-api-gateway
```

O `PORT` é definido automaticamente pelo Heroku.

### Script de deploy automatizado

O arquivo [script.sh](script.sh) aceita estas envs de entrada:

- `API_APP_NAME`
- `WORKER_APP_NAME`
- `CORS_ORIGIN_VALUE`
- `NEON_DATABASE_URL`
- `EXTERNAL_DATABASE_URL`
- `NODE_ENV_OVERRIDE`
- `JWT_SECRET_VALUE`
- `KAFKA_ADDON_PLAN`
- `KAFKA_BROKERS_VALUE`
- `KAFKA_SASL_USERNAME_VALUE`
- `KAFKA_SASL_PASSWORD_VALUE`
- `KAFKA_SSL_VALUE`
- `KAFKA_SASL_MECHANISM_VALUE`

Exemplo completo com Neon + Kafka free:

```bash
env \
  NEON_DATABASE_URL="<NEON_DATABASE_URL>" \
  KAFKA_ADDON_PLAN="kafkacluster:test" \
  CORS_ORIGIN_VALUE="https://<seu-front>.vercel.app" \
  fish ./script.sh
```

### 5) Configurar variáveis do Transaction Service no Heroku

```bash
heroku config:set NODE_ENV=production --app fintrack-transaction-service
heroku config:set JWT_SECRET="<SEGREDO_COM_32+_CARACTERES>" --app fintrack-transaction-service
```

### 6) Criar Secrets no GitHub

No repositório, em **Settings > Secrets and variables > Actions**, crie:

- `HEROKU_API_KEY`
- `HEROKU_EMAIL`
- `HEROKU_APP_NAME_API_GATEWAY`
- `HEROKU_APP_NAME_TRANSACTION_SERVICE`
- `HEROKU_DATABASE_URL` (usada na migration automática do Drizzle)
- `JWT_SECRET`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_API_URL` (URL pública do API Gateway no Heroku)

### 7) Workflows disponíveis

- Back-end Heroku: `.github/workflows/deploy-backend-heroku.yml`
- Front-end Vercel: `.github/workflows/deploy-web-vercel.yml`

Ao fazer push na `main`, os workflows fazem deploy automático.



---

<div align="center">
  Desenvolvido por <strong>Jefferson Charlles</strong> · Engenharia de Software & Arquiteturas Escaláveis
</div>
