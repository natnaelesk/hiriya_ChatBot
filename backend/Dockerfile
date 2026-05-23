# Multi-stage build for the Hiriya backend.
# Stage 1: install full deps so we can run a sanity check (and for future build steps).
# Stage 2: ship a slim image with prod deps only.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy production deps from the deps stage.
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# App source.
COPY src ./src
COPY scripts ./scripts

# Run as non-root.
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3001
ENV PORT=3001 HOST=0.0.0.0

# Built-in healthcheck — probes /api/health.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "src/index.js"]
