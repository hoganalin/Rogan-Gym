#!/usr/bin/env node
/**
 * 灌一份乾淨的示範資料：6 位教練（真人照片 + 正常敘述）、8 個技能標籤、
 * 3 個堂數方案、6 堂課程，內容對照設計稿的 COACHES / SKILLS / packages。
 * 全程只打 HTTP API，不直接寫資料庫，跑幾次都是同一組資料。
 *
 * 使用前提：
 * - backend 已啟動（docker compose up -d），可打 http://127.0.0.1:8080
 * - 資料庫是空的，或至少沒有同名的 email / 技能 / 方案（否則 API 會回 409）
 *
 * 清空資料庫（本機開發用，會刪掉所有使用者/教練/課程/方案資料）：
 *   docker exec node-js-final-2026-postgres-1 psql -U student -d fitness -c \
 *     'TRUNCATE TABLE course_booking, credit_purchases, coach_link_skill, course, credit_packages, skills, coaches, "user" CASCADE;'
 *
 * 執行灌資料：
 *   node scripts/seed-demo-data.mjs
 *
 * 注意：後端的 profile_image_url 驗證強制要求 https 開頭，本地的
 * frontend/public/assets/coach-0X.png 過不了這道驗證，所以這裡先用假的
 * https 佔位網址建立教練，跑完後腳本會印出一段 SQL，貼到 psql 執行即可把
 * 圖片網址改回本地路徑。
 */

const API = process.env.API_BASE_URL ?? "http://127.0.0.1:8080/api";
const PASSWORD = "Demo12345";

async function req(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok || json.status === "failed" || json.status === "error") {
    throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(json)}`);
  }
  return json.data;
}

const SKILL_NAMES = ["肌力訓練", "核心訓練", "有氧體能", "動作矯正", "瑜珈", "壺鈴", "臀腿專項", "運動傷害"];

const PACKAGES = [
  { name: "體驗方案", price: 2400, credit_amount: 4 },
  { name: "標準方案", price: 8800, credit_amount: 16 },
  { name: "年度方案", price: 24000, credit_amount: 48 },
];

const COACHES = [
  {
    name: "陳建宏",
    email: "chen.jianhong@rfitness.tw",
    years: 6,
    realImage: "/assets/coach-01.png",
    skills: ["肌力訓練", "動作矯正"],
    description: "專注肌力訓練與體態調整，六年一對一教學經驗。擅長替久坐族設計漸進式課表。",
  },
  {
    name: "林雅婷",
    email: "lin.yating@rfitness.tw",
    years: 4,
    realImage: "/assets/coach-02.png",
    skills: ["核心訓練", "瑜珈"],
    description: "從產後修復到日常體能，用呼吸與核心串起每一次訓練。",
  },
  {
    name: "王柏翔",
    email: "wang.boxiang@rfitness.tw",
    years: 8,
    realImage: "/assets/coach-03.png",
    skills: ["壺鈴", "有氧體能"],
    description: "壺鈴與代謝循環專項，八年帶課經驗，課表節奏明確、強度可調。",
  },
  {
    name: "張怡君",
    email: "zhang.yijun@rfitness.tw",
    years: 3,
    realImage: "/assets/coach-04.png",
    skills: ["臀腿專項", "肌力訓練"],
    description: "以臀腿為核心的體態訓練，重視動作品質勝過重量數字。",
  },
  {
    name: "李宗翰",
    email: "li.zonghan@rfitness.tw",
    years: 10,
    realImage: "/assets/coach-05.png",
    skills: ["動作矯正", "運動傷害"],
    description: "物理治療背景，十年處理肩頸與下背疼痛的訓練規劃。",
  },
  {
    name: "吳佩蓉",
    email: "wu.peirong@rfitness.tw",
    years: 5,
    realImage: "/assets/coach-06.png",
    skills: ["有氧體能", "核心訓練"],
    description: "高強度間歇與體能耐力，適合想提升日常精神與心肺的會員。",
  },
];

function inDays(days, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// coachIndex 對應 COACHES 的索引（0 起算）
const COURSES = [
  {
    coachIndex: 0,
    skill: "肌力訓練",
    name: "槓鈴肌力入門",
    description: "深蹲、硬舉、臥推三大動作基礎建立",
    start: inDays(1, 19, 0),
    end: inDays(1, 20, 0),
    max: 10,
  },
  {
    coachIndex: 1,
    skill: "核心訓練",
    name: "核心穩定訓練",
    description: "呼吸控制與深層核心啟動",
    start: inDays(2, 7, 30),
    end: inDays(2, 8, 30),
    max: 12,
  },
  {
    coachIndex: 2,
    skill: "壺鈴",
    name: "壺鈴代謝循環",
    description: "壺鈴擺盪組合，提升心肺與後側鏈",
    start: inDays(3, 10, 0),
    end: inDays(3, 11, 0),
    max: 8,
  },
  {
    coachIndex: 3,
    skill: "臀腿專項",
    name: "臀腿雕塑訓練",
    description: "臀腿肌群啟動與負重深蹲",
    start: inDays(2, 18, 0),
    end: inDays(2, 19, 0),
    max: 10,
  },
  {
    coachIndex: 4,
    skill: "動作矯正",
    name: "動作矯正評估",
    description: "肩頸與下背疼痛的動作篩檢",
    start: inDays(4, 20, 0),
    end: inDays(4, 21, 0),
    max: 6,
  },
  {
    coachIndex: 5,
    skill: "有氧體能",
    name: "有氧燃脂間歇",
    description: "高強度間歇訓練，提升心肺與代謝",
    start: inDays(5, 19, 30),
    end: inDays(5, 20, 30),
    max: 12,
  },
];

async function main() {
  console.log(`API base: ${API}`);

  console.log("建立技能標籤...");
  const skillIdByName = {};
  for (const name of SKILL_NAMES) {
    const skill = await req("POST", "/coaches/skill", { name });
    skillIdByName[name] = skill.id;
    console.log(`  ${name} -> ${skill.id}`);
  }

  console.log("建立堂數方案...");
  for (const p of PACKAGES) {
    await req("POST", "/credit-package", p);
    console.log(`  ${p.name}`);
  }

  console.log("建立教練...");
  const coachInfo = [];
  for (const c of COACHES) {
    const placeholderImage = `https://rfitness.tw/placeholder/${c.realImage.split("/").pop()}`;

    const signupData = await req("POST", "/users/signup", { name: c.name, email: c.email, password: PASSWORD });
    const userId = signupData.user.id;

    const promoted = await req("POST", `/admin/coaches/${userId}`, {
      experience_years: c.years,
      description: c.description,
      profile_image_url: placeholderImage,
    });
    const coachId = promoted.coach.id;

    const loginData = await req("POST", "/users/login", { email: c.email, password: PASSWORD });
    const token = loginData.token;

    const skillIds = c.skills.map((s) => skillIdByName[s]);
    await req(
      "PUT",
      "/admin/coaches",
      { skill_ids: skillIds, experience_years: c.years, description: c.description, profile_image_url: placeholderImage },
      token,
    );

    coachInfo.push({ name: c.name, email: c.email, coachId, token });
    console.log(`  ${c.name} -> ${coachId}`);
  }

  console.log("建立課程...");
  for (const course of COURSES) {
    const coach = coachInfo[course.coachIndex];
    const skillId = skillIdByName[course.skill];
    await req(
      "POST",
      "/admin/coaches/courses",
      {
        skill_id: skillId,
        name: course.name,
        description: course.description,
        start_at: course.start,
        end_at: course.end,
        max_participants: course.max,
        meeting_url: "https://meet.rfitness.tw/demo",
      },
      coach.token,
    );
    console.log(`  ${course.name}（${coach.name}）`);
  }

  console.log("\n完成。教練照片目前是佔位網址，貼下面這段到 psql 換回本地路徑：\n");
  console.log('UPDATE coaches');
  console.log("SET profile_image_url = v.img");
  console.log("FROM (VALUES");
  console.log(
    COACHES.map((c) => `  ('${c.email}','${c.realImage}')`).join(",\n") + "",
  );
  console.log(") AS v(email, img)");
  console.log('JOIN "user" u ON u.email = v.email');
  console.log("WHERE coaches.user_id = u.id;");
}

main().catch((err) => {
  console.error("SEED FAILED:", err.message);
  process.exitCode = 1;
});
