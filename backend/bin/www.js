const app = require("../app");
const { dataSource } = require("../db/data-source");
const { get } = require("../config");

async function start() {
  try {
    await dataSource.initialize();
    console.log("資料庫連線成功");

    const port = get("web.port");
    app.listen(port, () => {
      console.log(`API 已啟動：http://localhost:${port}`);
    });
  } catch (err) {
    console.error("資料庫連線失敗", err);
    process.exit(1);
  }
}

start();
