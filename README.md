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



---

<div align="center">
  Desenvolvido por <strong>Jefferson Charlles</strong> · Engenharia de Software & Arquiteturas Escaláveis
</div>
