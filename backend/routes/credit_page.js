const express = require("express");
const router = express.Router();
const creditPageController = require("../controllers/creditPackage");
const isAuth = require("../middlewares/isAuth");

router.get("/", creditPageController.getCreditPage);
router.post("/", creditPageController.postCreditPackage);
router.delete("/:creditPackageId", creditPageController.deleteCreditPackage);
router.post("/:creditPackageId", isAuth, creditPageController.buyCreditPackage);
module.exports = router;
