# ---------- Stage 1 : ติดตั้ง dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Stage 2 : Production image ----------
FROM node:20-alpine
WORKDIR /app

# คัดลอกไฟล์ที่จำเป็นทั้งหมด
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package*.json ./
COPY run-db.sh ./
COPY .env.example ./

# กำหนดสิทธิ์ให้ user node
RUN chown -R node:node /app

ENV NODE_ENV=production
EXPOSE 3030

USER node

CMD ["node", "src/index.js"]

