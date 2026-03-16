FROM node:20-alpine

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api-gateway ./apps/api-gateway

RUN pnpm install --frozen-lockfile --filter api-gateway...

ENV NODE_ENV=production

WORKDIR /workspace/apps/api-gateway
EXPOSE 3000

CMD ["pnpm", "start"]
