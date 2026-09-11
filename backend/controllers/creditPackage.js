const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isInteger } = require("../utils/validUtils");
const { isValidString } = require("../utils/validUtils");
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const creditPackageController = {
  async getCreditPage(req, res, next) {
    const creditPackageRepository = dataSource.getRepository("CreditPackage");
    const creditPackages = await creditPackageRepository.find();
    res.status(200).json({ status: "success", data: creditPackages });
  },
  async postCreditPackage(req, res, next) {
    const { name, price, credit_amount } = req.body;
    // 任一欄位沒給；name 不是字串或為空；credit_amount 或 price 不是數字、是負數、或帶小數
    if (
      !name ||
      !isValidString(name) ||
      !isInteger(price) ||
      !credit_amount ||
      !isInteger(credit_amount) ||
      price < 0 ||
      credit_amount < 0
    ) {
      next(appError(400, "欄位未填寫正確")); //拋送錯誤
      return;
    }
    //   name 與既有方案重複
    const creditPackageRepository = dataSource.getRepository("CreditPackage");
    const sameNameCreditPackage = await creditPackageRepository.findOneBy({
      name: name.trim(),
    });
    if (sameNameCreditPackage) {
      next(appError(409, "資料重複"));
      return;
    }
    //存到資料庫裏面使用語法save()，參數是物件格式
    const creditPackage = await creditPackageRepository.save({
      name: name.trim(),
      price: price,
      credit_amount: credit_amount,
    });
    res.status(200).json({ status: "success", data: creditPackage });
  },
  async deleteCreditPackage(req, res, next) {
    const { creditPackageId } = req.params;
    if (!uuidRegex.test(creditPackageId)) {
      return next(appError(400, "ID錯誤"));
    }

    const result = await dataSource
      .getRepository("CreditPackage")
      .delete(creditPackageId);
    if (result.affected === 0) {
      return next(appError(400, "ID錯誤"));
    }
    res.status(200).json({ status: "success", data: result });
  },
  async buyCreditPackage(req, res, next) {
    const { creditPackageId } = req.params;
    const creditPackage = await dataSource
      .getRepository("CreditPackage")
      .findOneBy({ id: creditPackageId });
    if (!creditPackage) {
      return next(appError(400, "ID錯誤"));
    }
    const creditPurchaseRepository = dataSource.getRepository("CreditPurchase");
    await creditPurchaseRepository.save({
      user_id: req.user.id,
      credit_package_id: creditPackage.id,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
    });
    res.status(200).json({ status: "success", data: null });
  },
};

module.exports = creditPackageController;
