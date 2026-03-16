FROM node:20-alpine

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/transaction-service ./apps/transaction-service

RUN pnpm install --frozen-lockfile --filter transaction-service...

ENV NODE_ENV=production

WORKDIR /workspace/apps/transaction-service

CMD ["pnpm", "start"]
