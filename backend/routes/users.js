const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const isAuth = require("../middlewares/isAuth");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/profile", isAuth, userController.profile); //isAuth中間件
router.get("/credit-package", isAuth, userController.getCreditPurchases);
router.put("/profile", isAuth, userController.putProfile);
router.put("/password", isAuth, userController.putPassword);
router.get("/courses", isAuth, userController.userGetCourses);

module.exports = router;
