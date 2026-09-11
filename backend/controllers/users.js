const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isValidString, isValidPassword } = require("../utils/validUtils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

const PWD_ERR = "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字";

const userController = {
  async signup(req, res, next) {
    const { name, email, password } = req.body;
    if (
      !isValidString(name) ||
      !isValidString(email) ||
      !isValidString(password)
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (!isValidPassword(password)) {
      return next(appError(400, PWD_ERR));
    }

    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOneBy({
      email: email.trim().toLowerCase(),
    });
    if (findUser) {
      return next(appError(409, "Email已被註冊"));
    }

    const newUser = await userRepo.save({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({
      status: "success",
      data: {
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      },
    });
  },

  async login(req, res, next) {
    const { email, password } = req.body;
    if (!isValidString(email) || !isValidString(password)) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (!isValidPassword(password)) {
      return next(appError(400, PWD_ERR));
    }

    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOneBy({
      email: email.trim().toLowerCase(),
    });
    if (!findUser || !(await bcrypt.compare(password, findUser.password))) {
      return next(appError(400, "使用者不存在或密碼輸入錯誤"));
    }

    const token = jwt.sign(
      { id: findUser.id, role: findUser.role },
      config.get("secret.jwtSecret"),
      { expiresIn: config.get("secret.jwtExpiresIn") },
    );
    res.status(201).json({
      status: "success",
      data: { token, user: { name: findUser.name } },
    });
  },

  async profile(req, res) {
    res.json({
      status: "success",
      data: { user: { name: req.user.name, email: req.user.email } },
    });
  },

  async putProfile(req, res, next) {
    const { name } = req.body;
    if (!isValidString(name)) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (name.trim() === req.user.name) {
      return next(appError(400, "使用者名稱未變更"));
    }

    const userRepo = dataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: req.user.id });
    if (!user) {
      return next(appError(400, "更新使用者資料失敗"));
    }
    user.name = name.trim();
    await userRepo.save(user);
    res
      .status(200)
      .json({ status: "success", data: { user: { name: user.name } } });
  },

  async putPassword(req, res, next) {
    const { password, new_password, confirm_new_password } = req.body;
    if (
      !isValidString(password) ||
      !isValidString(new_password) ||
      !isValidString(confirm_new_password)
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (
      !isValidPassword(password) ||
      !isValidPassword(new_password) ||
      !isValidPassword(confirm_new_password)
    ) {
      return next(appError(400, PWD_ERR));
    }
    if (new_password === password) {
      return next(appError(400, "新密碼不能與舊密碼相同"));
    }
    if (new_password !== confirm_new_password) {
      return next(appError(400, "新密碼與驗證新密碼不一致"));
    }
    if (!(await bcrypt.compare(password, req.user.password))) {
      return next(appError(400, "密碼輸入錯誤"));
    }

    const userRepo = dataSource.getRepository("User");
    req.user.password = await bcrypt.hash(new_password, 10);
    await userRepo.save(req.user);
    res.status(200).json({ status: "success", data: null });
  },
  async getCreditPurchases(req, res, next) {
    const purchases = await dataSource.getRepository("CreditPurchase").find({
      where: { user_id: req.user.id },
      order: { purchase_at: "DESC" },
    });
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const data = await Promise.all(
      purchases.map(async (purchase) => {
        const creditPackage = await creditPackageRepo.findOneBy({
          id: purchase.credit_package_id,
        });
        return {
          name: creditPackage?.name,
          purchased_credits: purchase.purchased_credits,
          price_paid: purchase.price_paid,
          purchase_at: purchase.purchase_at,
        };
      }),
    );
    res.status(200).json({ status: "success", data });
  },
  async userGetCourses(req, res, next) {
    const purchaseRepo = dataSource.getRepository("CreditPurchase");
    const bookingRepo = dataSource.getRepository("CourseBooking");
    const purchases = await purchaseRepo.find({
      where: { user_id: req.user.id },
    });
    const totalCredits = purchases.reduce(
      (total, purchase) => total + purchase.purchased_credits,
      0,
    );
    const allBookings = await bookingRepo.find({
      where: { user_id: req.user.id },
      relations: { course: { coach: { user: true } } },
      order: { created_at: "DESC" },
    });
    const creditUsage = allBookings.filter((b) => !b.cancelled_at).length;
    const creditRemain = totalCredits - creditUsage;
    const courseBookings = allBookings.map((b) => ({
      course_id: b.course_id,
      name: b.course.name,
      start_at: b.course.start_at,
      end_at: b.course.end_at,
      meeting_url: b.course.meeting_url,
      coach_name: b.course.coach.user.name,
      cancelled_at: b.cancelled_at,
    }));
    res.status(200).json({
      status: "success",
      data: {
        credit_remain: creditRemain,
        credit_usage: creditUsage,
        course_booking: courseBookings,
      },
    });
  },
};

module.exports = userController;
