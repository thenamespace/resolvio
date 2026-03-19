FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm run build

# ---

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
