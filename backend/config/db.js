module.exports = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // # 下面兩個是給「用課堂 TypeORM 寫法」的人：CI 驗收時也會帶這兩個值
  // # 想練 W8 教的 migration：把 DB_SYNCHRONIZE 改成 false，改用 npm run migration:run 建表
  // # （CI 仍然會帶 true，所以走哪條路驗收都不受影響）
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  ssl: process.env.DB_ENABLE_SSL === "true",
};
