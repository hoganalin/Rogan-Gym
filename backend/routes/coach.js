const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coach");
const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");
//核心規則是：固定路徑要放在動態參數路徑前面。
router.get("/", isAuth, isCoach, coachController.getCoach);
router.put("/", isAuth, isCoach, coachController.putCoach);
router.get("/courses", isAuth, isCoach, coachController.getAdminCoachCourses);
router.post("/courses", isAuth, isCoach, coachController.addCoachCourses);
router.get("/courses/:courseId", isAuth, coachController.getCoachCourse);
router.get("/revenue", isAuth, isCoach, coachController.getRevenue);
router.put(
  "/courses/:courseId",
  isAuth,
  isCoach,
  coachController.putCoachCourse,
); //更新單一課程
router.post("/:userid", coachController.assignCoach);

module.exports = router;
