const express = require("express");
const router = express.Router();
const coachPublicController = require("../controllers/coachPublic");
const isCoachLegal = require("../middlewares/isCouachIdLeagal");
//核心規則是：固定路徑要放在動態參數路徑前面。
router.get("/", coachPublicController.getCoachPublic);
router.get("/:coachId", isCoachLegal, coachPublicController.getCoachPublicById);
router.get(
  "/:coachId/courses",
  isCoachLegal,
  coachPublicController.getCoachPublicCourses,
);

module.exports = router;
