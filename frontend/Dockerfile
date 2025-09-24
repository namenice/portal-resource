# ---------- Stage 1 : Build React App ----------
FROM node:20-alpine AS build
WORKDIR /app

# คัดลอกไฟล์ที่ใช้ติดตั้ง dependencies
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอก source code
COPY . .

# Build โปรเจกต์ (output จะไปที่ dist/ หรือ build/ แล้วแต่ framework)
RUN npm run build


# ---------- Stage 2 : Production Image ----------
FROM nginx:stable-alpine

# คัดลอกไฟล์ build จาก stage ก่อนหน้าไปยัง nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html
# ถ้าใช้ CRA จะต้องเปลี่ยนเป็น /app/build
# COPY --from=build /app/build /usr/share/nginx/html

# คัดลอก config nginx ของเรา (optional ถ้าต้องการ rewrite routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

