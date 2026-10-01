const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isValidString } = require("../utils/validUtils");

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function isCoach(req, res, next) {
  const { coachId } = req.params;
  // 觸發條件分兩種：
  // (2) coachId 為空或無效字串（例如字面的 undefined）→ 「欄位未填寫正確」
  if (!isValidString(coachId) || !uuidRegex.test(coachId)) {
    return next(appError(400, "欄位未填寫正確"));
  }

  next();
}
module.exports = isCoach;
