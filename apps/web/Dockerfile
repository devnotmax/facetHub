FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @facet/web build

FROM nginx/nginx-unprivileged:1.30.6-alpine AS runner
COPY --chown=101:101 apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:101 /app/apps/web/dist /usr/share/nginx/html

USER 101
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
