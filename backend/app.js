const express = require("express");
const cors = require("cors");
const { dataSource } = require("./db/data-source");
const appError = require("./utils/appError");
const skill = require("./routes/skill"); //註冊路由
const users = require("./routes/users"); //註冊路由
const coach = require("./routes/coach"); //註冊教練後台路由
const coachPublic = require("./routes/coachPublic"); //註冊公開教練路由
const courses = require("./routes/courses"); //註冊公開課程路由

const creditPackage = require("./routes/credit_page"); //註冊路由
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/credit-package", creditPackage);

app.get("/healthcheck", async (req, res, next) => {
  try {
    await dataSource.query("SELECT 1");
    res.status(200).send("OK");
  } catch (err) {
    res.status(503).send("Service Unavailable");
  }
});
app.use("/api/coaches/skill", skill);
app.use("/api/users", users);
app.use("/api/coach", coach);
app.use("/api/coaches", coachPublic);
app.use("/api/courses", courses);
// 404
app.use((req, res, next) => {
  next(appError(404, "無此路由"));
});

// 統一錯誤回應格式。
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(err);
  res.status(statusCode).json({
    status: statusCode === 500 ? "error" : "failed",
    message: err.message || "伺服器內部錯誤",
  });
});
module.exports = app;
