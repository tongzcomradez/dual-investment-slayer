# ใช้ Node.js ภาพฐานล่าสุดกับ Alpine 22
FROM node:latest-alpine

# ตั้งค่าสถานที่ทำงานใน Docker image
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (หากมี) ไปยัง Docker image
COPY package*.json ./

# ติดตั้ง dependencies ที่จำเป็นในไฟล์ package.json
RUN npm install

# คัดลอกไฟล์ source code ทั้งหมดจาก host ไปยัง Docker image
COPY . .

# เปิดพอร์ตที่โปรเจ็กต์ใช้งาน (หากโปรเจ็กต์ของคุณมีการใช้งานพอร์ตอื่น ก็เปลี่ยนตามความเหมาะสม)
EXPOSE 3000

# สั่งให้รันแอปพลิเคชันเมื่อ container เริ่มทำงาน
CMD ["node", "app.js"]