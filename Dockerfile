FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm run build

# ---

FROM node:20-slim AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

EXPOSE 3000

# Cap V8 old-space below the container memory limit (512Mi) so the process
# GCs hard instead of being OOM-killed or crashing in GC under load.
CMD ["node", "--max-old-space-size=384", "dist/main"]
