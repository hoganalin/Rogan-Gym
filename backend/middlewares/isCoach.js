const appError = require("../utils/appError");
function isCoach(req, res, next) {
  if (!req.user || req.user.role !== "COACH") {
    return next(appError(403, "需要教練權限"));
  }
  next();
}
module.exports = isCoach;
