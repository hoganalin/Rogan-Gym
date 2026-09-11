# 使用哪個環境
FROM node:20-alpine 
# 設定工作目錄
WORKDIR /app
# 複製檔案
COPY package*.json ./
# 安裝依賴,因為 ci, 所以只會安裝package-lock.json的版本
# 執行 npm ci --omit=dev 時，只會安裝 dependencies 裡的套件，而不會安裝 devDependencies。
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD ["node", "./bin/www.js"]
