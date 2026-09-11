const { IsNull, LessThanOrEqual, MoreThan } = require("typeorm");
const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const coursesController = {
  async getCourses(req, res, next) {
    const now = new Date();
    const courseRepo = dataSource.getRepository("Course");
    const courses = await courseRepo.find({
      where: { start_at: LessThanOrEqual(now), end_at: MoreThan(now) },
      order: { start_at: "ASC" },
    });
    const coachRepo = dataSource.getRepository("Coach");
    const skillRepo = dataSource.getRepository("Skill");
    const data = await Promise.all(
      courses.map(async (course) => {
        const coach = await coachRepo.findOne({
          where: { id: course.coach_id },
          relations: { user: true },
        });
        const skill = await skillRepo.findOneBy({ id: course.skill_id });
        return {
          id: course.id,
          name: course.name,
          description: course.description,
          start_at: course.start_at,
          end_at: course.end_at,
          max_participants: course.max_participants,
          coach_name: coach?.user?.name,
          skill_name: skill?.name,
        };
      }),
    );
    res.status(200).json({ status: "success", data });
  },
  async createBooking(req, res, next) {
    const { courseId } = req.params;
    const purchaseRepo = dataSource.getRepository("CreditPurchase");
    const courseRepo = dataSource.getRepository("Course");
    const bookingRepo = dataSource.getRepository("CourseBooking");

    // 1.查無此課程
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) {
      return next(appError(400, "課程不存在"));
    }
    // ② 已報名（含已取消)
    const existingBookings = await bookingRepo.findOneBy({
      user_id: req.user.id,
      course_id: courseId,
    });
    if (existingBookings) {
      return next(appError(400, "已經報名過此課程"));
    }
    // ③ 剩餘堂數歸零
    // 求已購買credit
    const purchases = await purchaseRepo.find({
      where: { user_id: req.user.id },
    });
    const totalCredits = purchases.reduce(
      (total, purchase) => total + purchase.purchased_credits,
      0,
    );
    // 求已使用credit,代表課程沒有取消
    const usageCount = await bookingRepo.count({
      where: {
        user_id: req.user.id,
        cancelled_at: IsNull(),
      },
    });
    if (totalCredits - usageCount <= 0) {
      return next(appError(400, "已無可使用堂數"));
    }
    //  ④ 超過最大報名人數
    //先求目前報名人數
    const bookingCount = await bookingRepo.count({
      where: {
        course_id: courseId,
        cancelled_at: IsNull(),
      },
    });
    if (bookingCount >= course.max_participants) {
      return next(appError(400, "已達最大參加人數，無法參加"));
    }
    //都通過, 可以報名
    await bookingRepo.save({ user_id: req.user.id, course_id: courseId });
    res.status(200).json({ status: "success", data: null });
  },
  async deleteBooking(req, res, next) {
    const { courseId } = req.params;
    const bookingRepo = dataSource.getRepository("CourseBooking");
    const courseRepo = dataSource.getRepository("Course");
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) {
      return next(appError(400, "課程不存在"));
    }
    const booking = await bookingRepo.findOneBy({
      user_id: req.user.id,
      course_id: courseId,
      cancelled_at: IsNull(),
    });
    if (!booking) {
      return next(appError(400, "ID錯誤"));
    }
    booking.cancelled_at = new Date();
    await bookingRepo.save(booking);
    res.status(200).json({ status: "success", data: null });
  },
};

module.exports = coursesController;
