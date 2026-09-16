const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const {
  isValidString,
  isInteger,
  isValidMonth,
} = require("../utils/validUtils");
const { IsNull } = require("typeorm");

const coachController = {
  async assignCoach(req, res, next) {
    const userId = req.user.id;
    const { experience_years, description, profile_image_url } = req.body;
    //欄位缺漏或格式不對（experience_years 不是 0 以上的整數、description 是空字串、profile_image_url 有值但不是 https 開頭）→「欄位未填寫正確」
    if (
      !isInteger(experience_years) ||
      experience_years < 0 ||
      !isValidString(description) ||
      !description.length ||
      (profile_image_url && !profile_image_url.startsWith("https"))
    ) {
      next(appError(400, "欄位未填寫正確"));
      return;
    }
    const userRepo = dataSource.getRepository("User");
    const coachRepo = dataSource.getRepository("Coach");
    const user = await dataSource.getRepository("User").findOneBy({
      id: userId,
    });
    if (!user) {
      next(appError(400, "使用者不存在"));
      return;
    }
    const findUser = await coachRepo.findOneBy({
      user_id: userId,
    });
    if (findUser) {
      next(appError(409, "使用者已經是教練"));
      return;
    }
    //存入資料庫

    const newCoach = await coachRepo.save({
      user_id: userId,
      experience_years: experience_years,
      description: description,
      profile_image_url: profile_image_url,
    });
    const updatedUser = await userRepo.save({
      ...user,
      role: "COACH",
    });
    //成功
    res.status(201).json({
      status: "success",
      data: {
        user: {
          name: updatedUser.name,
          role: updatedUser.role,
        },
        coach: {
          id: newCoach.id,
          user_id: newCoach.user_id,
          experience_years: newCoach.experience_years,
          description: newCoach.description,
          profile_image_url: newCoach.profile_image_url,
          created_at: newCoach.created_at,
          updated_at: newCoach.updated_at,
        },
      },
    });
    return;
  },
  async getCoach(req, res, next) {
    const coachRepo = dataSource.getRepository("Coach");
    const coaches = await coachRepo.findOneBy({ user_id: req.user.id });
    const coachSkillRepo = dataSource.getRepository("CoachLinkSkill");

    const coachSkills = await coachSkillRepo.find({
      where: { coach_id: coaches.id },
    });
    //.find(options)：options 是一個設定物件，可以放 where（篩選條件）、select（只挑哪些欄位）、order（排序）、relations（要不要一起帶出關聯資料）等等。
    // where: { coach_id: coaches.id }：篩選條件，意思是「只找 coach_id 欄位等於 coaches.id 的那些列」——也就是「這位教練綁定過的所有技能關聯紀錄」。
    // 回傳值是一個陣列（可能是 0 筆、1 筆、或多筆）

    res.json({
      status: "success",
      data: {
        id: coaches.id,
        experience_years: coaches.experience_years,
        description: coaches.description,
        profile_image_url: coaches.profile_image_url,
        skill_ids: coachSkills.map((skill) => skill.skill_id),
      },
    });
    return;
  },
  async putCoach(req, res, next) {
    //等待資料庫連線成功後，才去找資料所以要使用await

    const { skill_ids, experience_years, description, profile_image_url } =
      req.body;

    //欄位缺漏或格式不對（experience_years 不是 0 以上的整數
    // description 沒給或是空字串
    // profile_image_url 沒給、是空字串、或不是 https 開頭（⚠️ 這支是必填）
    // skill_ids 沒給、不是陣列、是空陣列、或元素不是有效的 id 字串
    if (
      !isInteger(experience_years) ||
      experience_years < 0 ||
      !isValidString(description) ||
      !description.length ||
      !profile_image_url ||
      !profile_image_url.startsWith("https")
    ) {
      next(appError(400, "欄位未填寫正確"));
      return;
    }
    const coachRepo = dataSource.getRepository("Coach");
    const coachSkillRepo = dataSource.getRepository("CoachLinkSkill");

    const coach = await dataSource.getRepository("Coach").findOneBy({
      user_id: req.user.id,
    });

    //更新教練基本欄位
    coach.experience_years = experience_years;
    coach.description = description;
    coach.profile_image_url = profile_image_url;
    await coachRepo.save(coach);

    //覆蓋整批教練技能
    await coachSkillRepo.delete({ coach_id: coach.id }); //先刪掉舊的技能關聯
    await coachSkillRepo.save(
      skill_ids.map((skill_id) => ({ coach_id: coach.id, skill_id })),
    ); //再新增新的技能關聯

    //回傳成功訊息
    res.status(200).json({
      status: "success",
      data: {
        id: coach.id,
        experience_years: coach.experience_years,
        description: coach.description,
        profile_image_url: coach.profile_image_url,
        skill_ids,
      },
    });
  },
  async getAdminCoachCourses(req, res, next) {
    const coachRepo = dataSource.getRepository("Coach");
    const coaches = await coachRepo.findOneBy({ user_id: req.user.id });
    const courses = await dataSource
      .getRepository("Course")
      .find({ where: { coach_id: coaches.id } });

    const courseBookingRepo = dataSource.getRepository("CourseBooking");
    const now = new Date();
    const data = await Promise.all(
      courses.map(async (course) => {
        const participants = await courseBookingRepo.count({
          where: { course_id: course.id, cancelled_at: IsNull() },
        }); //回傳一個數字
        let status;
        if (now < course.start_at) {
          status = "尚未開始";
        } else if (now > course.end_at) {
          status = "已結束";
        } else {
          status = "進行中";
        }
        return {
          id: course.id,
          name: course.name,
          status,
          start_at: course.start_at,
          end_at: course.end_at,
          max_participants: course.max_participants,
          meeting_url: course.meeting_url,
          participants: participants,
        };
      }),
    );
    res.json({
      status: "success",
      data,
    });
  },
  async addCoachCourses(req, res, next) {
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;
    const coachRepo = dataSource.getRepository("Coach");
    //從 Coach 資料表中，找出目前登入使用者對應的教練資料。
    const coaches = await coachRepo.findOneBy({ user_id: req.user.id });
    const courseRepo = dataSource.getRepository("Course");
    const utcIso8601Regex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);
    //欄位缺漏或格式不對（meeting_url 必須以 https 開頭，否則一樣回「欄位未填寫正確」
    // 、max_participants 必須是「數字型別」的 0 以上整數
    // 、start_at／end_at 必須是 UTC ISO 8601 字串，且結束時間晚於開始時間
    //→「欄位未填寫正確」
    if (
      !isValidString(skill_id) ||
      !isValidString(name) ||
      !isValidString(description) ||
      !isValidString(start_at) ||
      !isValidString(end_at) ||
      !isValidString(meeting_url) ||
      !meeting_url.startsWith("https") ||
      !isInteger(max_participants) ||
      max_participants < 0 ||
      !utcIso8601Regex.test(start_at) ||
      !utcIso8601Regex.test(end_at) ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      next(appError(400, "欄位未填寫正確"));
      return;
    }

    const course = await courseRepo.save({
      coach_id: coaches.id, //Course資料表 的 relations 中 coach_id欄位對應 Coach 資料表的 id欄位
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    });

    res.status(201).json({
      status: "success",
      data: {
        course: {
          id: course.id,
          user_id: coaches.user_id,
          skill_id: course.skill_id,
          name: course.name,
          description: course.description,
          start_at: course.start_at,
          end_at: course.end_at,
          max_participants: course.max_participants,
          meeting_url: course.meeting_url,
          created_at: course.created_at,
          updated_at: course.updated_at,
        },
      },
    });
  },
  async getCoachCourse(req, res, next) {
    const { courseId } = req.params;
    const coach = await dataSource.getRepository("Coach").findOneBy({
      user_id: req.user.id,
    });
    const courseData = await dataSource.getRepository("Course").findOneBy({
      id: courseId,
      coach_id: coach?.id,
    });
    if (!courseData) {
      return next(appError(400, "課程不存在"));
    }
    const skill = await dataSource.getRepository("Skill").findOneBy({
      id: courseData.skill_id,
    });
    res.status(200).json({
      status: "success",
      data: {
        id: courseData.id,
        skill_name: skill?.name,
        skill_id: courseData.skill_id,
        name: courseData.name,
        description: courseData.description,
        start_at: courseData.start_at,
        end_at: courseData.end_at,
        max_participants: courseData.max_participants,
        meeting_url: courseData.meeting_url,
      },
    });
  },
  async putCoachCourse(req, res, next) {
    const courseId = req.params.courseId;
    const courseRepo = dataSource.getRepository("Course");
    const coachRepo = dataSource.getRepository("Coach");
    const course = await courseRepo.findOneBy({ id: courseId });
    const coaches = await coachRepo.findOneBy({ user_id: req.user.id });
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;
    // ①任一欄位缺漏／空字串／max_participants 非數字整數／meeting_url 不是 https 開頭 →「欄位未填寫正確」
    const utcIso8601Regex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);
    if (
      !isInteger(max_participants) ||
      max_participants < 0 ||
      !isValidString(meeting_url) ||
      !meeting_url.startsWith("https") ||
      !isValidString(skill_id) ||
      !isValidString(name) ||
      !isValidString(description) ||
      !isValidString(start_at) ||
      !isValidString(end_at) ||
      !utcIso8601Regex.test(start_at) ||
      !utcIso8601Regex.test(end_at) ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (!course || course.coach_id !== coaches?.id) {
      //課程 id 不存在或不是登入者本人開的 →「課程不存在」
      return next(appError(400, "課程不存在"));
    }
    course.skill_id = skill_id;
    course.name = name;
    course.description = description;
    course.start_at = start_at;
    course.end_at = end_at;
    course.max_participants = max_participants;
    course.meeting_url = meeting_url;
    await courseRepo.save(course);
    res.status(200).json({
      status: "success",
      data: {
        course,
      },
    });
  },
  async getRevenue(req, res, next) {
    const { month } = req.query;

    if (!month || !isValidMonth(month)) {
      return next(appError(400, "欄位未填寫正確"));
    }

    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const monthIndex = monthNames.indexOf(month) + 1; //把英文月份轉換成數字
    const year = new Date().getFullYear();

    // 目前專案的 Course 實際以 coach_id 關聯 coaches.id，資料表名稱是
    // course / course_booking，因此這裡用目前 schema 對應的欄位查詢。
    // 直接執行原生 SQL
    const bookings = await dataSource.query(
      `SELECT cb.user_id
       FROM course_booking cb 
       JOIN course c ON c.id = cb.course_id
       JOIN coaches coach ON coach.id = c.coach_id
       WHERE coach.user_id = $1
         AND cb.cancelled_at IS NULL
         AND EXTRACT(YEAR FROM cb.created_at) = $2
         AND EXTRACT(MONTH FROM cb.created_at) = $3`,
      [req.user.id, year, monthIndex],
    );
    // 把 course_booking 這張表格取一個別名叫 cb
    // 篩選條件一:教練資料裡的 user_id(對應到登入使用者的帳號 id)要等於 $1(第一個參數，也就是後面陣列的 req.user.id)
    // 篩選條件二:預約沒有被取消(cancelled_at 是空的)，排除已取消的預約。
    //EXTRACT(欲取出的單位 FROM 日期欄位)
    // 篩選條件三:預約建立時間的「年」要等於 $2(對應陣列第二個參數 year)。
    // 篩選條件四:預約建立時間的「月份」要等於 $3(對應陣列第三個參數 monthIndex)。

    // 查詢所有方案
    const packages = await dataSource.getRepository("CreditPackage").find();
    //計算所有方案的總價格
    const totalPrice = packages.reduce(
      (sum, pkg) => sum + Number(pkg.price || 0),
      0,
    );
    //計算所有方案的總堂數
    const totalCredits = packages.reduce(
      (sum, pkg) => sum + Number(pkg.credit_amount || 0),
      0,
    );
    const averagePrice = totalCredits === 0 ? 0 : totalPrice / totalCredits;

    const participants = new Set(bookings.map((booking) => booking.user_id))
      .size;
    // bookins.map會把 [{user_id:5}, {user_id:5}, {user_id:8}] 轉成 [5, 5, 8](單純的數字陣列)。
    // [5, 5, 8] 丟進 new Set()，重複的 5 只會留一個，結果變成 Set {5, 8}
    //Set 物件有個屬性叫 .size，代表這個集合裡有幾個不重複的元素(對比陣列是用 .length)。Set {5, 8}.size 會是 2。
    const revenue = Math.floor(participants * averagePrice);

    res.status(200).json({
      status: "success",
      data: {
        total: {
          revenue,
          participants,
          course_count: bookings.length,
        },
      },
    });
  },
};

module.exports = coachController;
