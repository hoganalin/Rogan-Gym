# Node.js 執行環境
FROM node:20-alpine 
# 設定工作目錄
WORKDIR /app
# 複製檔案
COPY package*.json ./
# 依 lockfile 安裝正式環境依賴。
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD ["node", "./bin/www.js"]
