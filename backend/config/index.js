// 把 .env 讀進 process.env，一定要在 require 各子設定檔之前執行
require("dotenv").config();

const db = require("./db");
const secret = require("./secret");
const web = require("./web");

const config = {
  db,
  secret,
  web,
};
function get(path) {
  const keys = path.split(".");
  let result = config;
  for (const key of keys) {
    result = result[key];
    if (result === undefined) {
      throw new Error(`找不到設定檔裡的 ${path} 這個 key`);
    }
  }
  return result;
}
module.exports = { get };
