const express = require("express");
const router = express.Router();
const creditPageController = require("../controllers/creditPackage");
const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");

router.get("/", creditPageController.getCreditPage);
router.post("/", isAuth, isCoach, creditPageController.postCreditPackage);
router.delete("/:creditPackageId", isAuth, isCoach, creditPageController.deleteCreditPackage);
router.post("/:creditPackageId", isAuth, creditPageController.buyCreditPackage);
module.exports = router;
