module.exports = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // # 下面兩個可依需求調整：
  // # 想改用 migration 管理 schema：把 DB_SYNCHRONIZE 改成 false，改用 npm run migration:run 建表
  // # （CI 預設仍帶 true，走哪條路都不影響 CI 結果）
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  ssl: process.env.DB_ENABLE_SSL === "true",
};
