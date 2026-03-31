FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# NEXT_PUBLIC env vars - needed during build for client-side code
ENV NEXT_PUBLIC_SUPABASE_URL=https://nkdrctopskgdojyrznir.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZHJjdG9wc2tnZG9qeXJ6bmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODA3NDMsImV4cCI6MjA4NTM1Njc0M30.HOsiMBQdlNAmW5TG9PK3vOvMhHe1um5iElsZNxTB-kI

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Instalar OpenSSL para o Prisma funcionar
RUN apk add --no-cache openssl

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma client gerado
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
