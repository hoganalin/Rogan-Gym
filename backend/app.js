const express = require("express");
const cors = require("cors");
const config = require("./config");
const { dataSource } = require("./db/data-source");
const appError = require("./utils/appError");
const skill = require("./routes/skill"); //註冊路由
const users = require("./routes/users"); //註冊路由
const coach = require("./routes/coach"); //註冊教練後台路由
const coachPublic = require("./routes/coachPublic"); //註冊公開教練路由
const courses = require("./routes/courses"); //註冊公開課程路由

const creditPackage = require("./routes/credit_page"); //註冊路由
const app = express();

app.use(cors()); // W3：前端在 3000、我們在 8080，沒它前端全被擋
app.use(express.json());

//啟動後端時，先連線資料庫,全部移動到www.js
// dataSource.initialize().then(() => {
// app.listen(config.get("web.port"), () => {
//   console.log(`server 跑起來了：http://localhost:${config.get("web.port")}`);
// }).catch((err) => {
//   console.error("資料庫連線失敗", err);
//   process.exit(1); // 沒有資料庫就不營業
// });

// M0：健康檢查——回純文字 OK，不是 JSON；路徑不在 /api 底下
//各種api
// 之後每完成一個里程碑，路由就多掛一條：
app.use("/api/credit-package", creditPackage);

app.get("/healthcheck", async (req, res, next) => {
  try {
    await dataSource.query("SELECT 1"); // 下SQL指令,確認資料庫連線正常
    res.status(200).send("OK");
  } catch (err) {
    res.status(503).send("Service Unavailable");
  }
});
app.use("/api/coaches/skill", skill);
app.use("/api/users", users);
app.use("/api/admin/coaches", coach);
app.use("/api/coaches", coachPublic);
app.use("/api/courses", courses);
// 404（W3）
app.use((req, res, next) => {
  // res.status(404).json({ status: "failed", message: "無此路由" });
  next(appError(404, "無此路由")); // 交給錯誤處理守門員
});

// 錯誤處理守門員（W4：四個參數）
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(err);
  res.status(statusCode).json({
    status: statusCode === 500 ? "error" : "failed",
    message: err.message || "伺服器內部錯誤",
  });
});
module.exports = app;
