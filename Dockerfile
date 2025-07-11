# Base image
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Chỉ copy file cấu hình trước để tối ưu cache
COPY package*.json ./

# Cài đặt thư viện phụ thuộc
RUN npm install

# Copy toàn bộ project (sau khi đã .dockerignore để tránh copy thư mục không cần thiết như node_modules)
COPY . .

# Thiết lập biến môi trường (tùy chọn)
ENV NODE_ENV=production

# Command mặc định khi container chạy
CMD ["node", "index.js"]
