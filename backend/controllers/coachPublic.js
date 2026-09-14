const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isValidString } = require("../utils/validUtils");
const { isInteger } = require("../utils/validUtils");
const { LessThanOrEqual, MoreThan } = require("typeorm");

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const coachPublicController = {
  async getCoachPublic(req, res, next) {
    // 回傳教練列表，支援分頁。per 是每頁筆數、page 是第幾頁（從 1 開始）。分頁要真的有作用：回第 page 頁、每頁最多 per 筆；該頁沒資料就回空陣列（仍是成功），不算錯誤。
    // per 和 page 都是必填：少帶任何一個、或帶了不能轉成非負整數的值（例如 per=test），都回 4xx + status: failed，message 為「欄位未填寫正確」。
    // 注意：回傳的 id 是「教練 id」，不是使用者 id。前端會拿這個 id 去打 GET /api/coaches/{coachId}，
    // user_id 才是這位教練對應的使用者 id，兩個欄位都要給、不要搞混。
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
      //單靠 coach_link_skill 表本身，我們只拿得到 skill_id（一串 uuid），
      // 拿不到技能的名稱。relations: { skill: true } 是告訴 TypeORM：
      // 「查詢的時候，順便用 skill_id 去 JOIN 對應的 Skill 表，把完整的 skill 物件（包含 name）一起帶出來」。
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
        return {
          id: course.id,
          name: course.name,
          description: course.description,
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
