const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isValidString } = require("../utils/validUtils");
const { isInteger } = require("../utils/validUtils");
const { LessThanOrEqual, MoreThan } = require("typeorm");
const { DEMO_COURSE_DESCRIPTION, getCourseDescription } = require("../constants/courseDescriptions");

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const coachPublicController = {
  async getCoachPublic(req, res, next) {
    // per 與 page 為必要分頁參數；id 和 user_id 分別為教練與會員識別碼。
    const { per, page } = req.query;
    const perNumber = Number(per);
    const pageNumber = Number(page);
    if (
      per === undefined ||
      page === undefined ||
      !Number.isInteger(perNumber) ||
      !Number.isInteger(pageNumber) ||
      perNumber < 0 ||
      pageNumber < 1
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }

    const coachRepo = dataSource.getRepository("Coach");
    const coaches = await coachRepo.find({
      relations: { user: true },
      order: { id: "ASC" }, //由小到大
      skip: (pageNumber - 1) * perNumber, //決定跳過幾筆。
      take: perNumber, //決定最多取得幾筆, 一頁最多perNumber筆
    });

    res.status(200).json({
      status: "success",
      data: coaches.map((coach) => ({
        id: coach.id,
        user_id: coach.user_id,
        name: coach.user?.name,
      })),
    });
  },
  async getCoachPublicById(req, res, next) {
    const coach = await dataSource.getRepository("Coach").findOne({
      where: { id: req.params.coachId },
      relations: { user: true },
    });
    if (!coach) {
      return next(appError(404, "找不到該教練"));
    }
    const coachSkills = await dataSource.getRepository("CoachLinkSkill").find({
      where: { coach_id: coach.id },
      // 載入技能關聯以回傳技能名稱。
      relations: { skill: true },
      order: { skill: { created_at: "ASC" } },
    });
    res.status(200).json({
      status: "success",
      data: {
        user: {
          name: coach.user?.name,
          role: coach.user?.role,
        },
        coach: {
          id: coach.id,
          user_id: coach.user_id,
          experience_years: coach.experience_years,
          description: coach.description,
          profile_image_url: coach.profile_image_url,
          created_at: coach.created_at,
          updated_at: coach.updated_at,
          skills: coachSkills.map((coachSkill) => coachSkill.skill.name),
        },
      },
    });
  },
  async getCoachPublicCourses(req, res, next) {
    const coach = await dataSource.getRepository("Coach").findOne({
      where: { id: req.params.coachId },
      relations: { user: true },
    });
    if (!coach) {
      return next(appError(404, "找不到該教練"));
    }

    const courses = await dataSource.getRepository("Course").find({
      where: { coach_id: coach.id, end_at: MoreThan(new Date()) },
      order: { start_at: "ASC" },
    });
    const skillRepo = dataSource.getRepository("Skill");
    const data = await Promise.all(
      courses.map(async (course) => {
        const skill = await skillRepo.findOneBy({ id: course.skill_id });
        const series = course.name.split("・")[1];
        const description = course.description === DEMO_COURSE_DESCRIPTION
          ? getCourseDescription(skill?.name, series) || course.description
          : course.description;
        return {
          id: course.id,
          name: course.name,
          description,
          start_at: course.start_at,
          end_at: course.end_at,
          max_participants: course.max_participants,
          coach_name: coach.user?.name,
          skill_name: skill?.name,
        };
      }),
    );
    res.status(200).json({ status: "success", data });
  },
};
module.exports = coachPublicController;
