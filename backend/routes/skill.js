const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skill");
const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");

router.get("/", skillController.getSkills);
router.post("/", isAuth, isCoach, skillController.postSkill);
router.delete("/:skillId", isAuth, isCoach, skillController.deleteSkill);

module.exports = router;
