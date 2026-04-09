# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server source (TypeScript executed via tsx at runtime)
COPY src/server ./src/server
COPY tsconfig.server.json ./

# Copy content directory for blog/docs
COPY content ./content

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "--import", "tsx", "src/server/index.ts"]
