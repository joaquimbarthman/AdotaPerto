FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

RUN npm ci --prefix backend --include=dev --legacy-peer-deps \
    && npm ci --prefix frontend

COPY backend ./backend
COPY frontend ./frontend

RUN npm run build --prefix backend \
    && npm run build --prefix frontend

FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production PORT=3000

COPY --from=build --chown=node:node /app/backend ./backend
COPY --from=build --chown=node:node /app/frontend ./frontend

USER node
EXPOSE 3000

CMD ["sh", "-c", "npm run db:setup --prefix backend && npm run start:render --prefix backend"]
