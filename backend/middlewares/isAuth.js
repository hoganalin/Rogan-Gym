const jwt = require("jsonwebtoken");
const { dataSource } = require("../db/data-source");
const config = require("../config/index");
const appError = require("../utils/appError");

async function isAuth(req, res, next) {
  try {
    // 1. 從 header 取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(appError(401, "請先登入"));
    }
    // authHeader會長這樣Barer token1234567890
    const token = authHeader.split(" ")[1];

    // 2. 驗證 token
    const decoded = jwt.verify(token, config.get("secret.jwtSecret"));
    //decoded會長這樣 { id: 1, role: 'user', iat: 1690000000, exp: 1690003600 }

    //token無效(內容不對或者查無此user):無效的 token
    //DAO層 SERVICE層
    // 3. 用 decoded.id 查 User
    const userRepo = dataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: decoded.id }); //透過id去找user，找不到就回傳null
    if (!user) {
      return next(appError(401, "無效的 token"));
    }

    // 4. 掛到 req.user，後續 controller 就能用
    req.user = user;
    next();
  } catch (err) {
    // token過期的話,會丟出錯誤, err.name叫做TokenExpiredError, 所以可以用err.name去判斷
    if (err.name === "TokenExpiredError") {
      return next(appError(401, "Token 已過期"));
    }
    return next(appError(401, "無效的 token"));
  }
}
module.exports = isAuth;
