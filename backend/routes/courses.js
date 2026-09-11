const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/courses");
const isAuth = require("../middlewares/isAuth");

router.get("/", coursesController.getCourses);
router.post("/:courseId", isAuth, coursesController.createBooking);
router.delete("/:courseId", isAuth, coursesController.deleteBooking);

module.exports = router;
