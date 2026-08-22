# Imagen de producción con output standalone de Next.js.
# https://nextjs.org/docs/app/getting-started/deploying#docker

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN npm install -g pnpm@11.8.0

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --config.strict-dep-builds=false

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN mkdir .next && chown node:node .next

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
