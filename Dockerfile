# Mitmeastmeline build, et lõplik image oleks väike ja kiire

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
# Prisma's query engine needs OpenSSL to load on Alpine
RUN apk add --no-cache openssl libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# openssl/libc6-compat: Prisma's query engine needs them at runtime.
# tzdata: so TZ=Europe/Tallinn resolves to real EET/EEST times instead of UTC.
RUN apk add --no-cache openssl libc6-compat tzdata
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
