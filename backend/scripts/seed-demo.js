// Only run against a demo database. Existing profiles and records are preserved.
const path = require("node:path");
const { createHash } = require("node:crypto");
process.chdir(path.resolve(__dirname, ".."));
const bcrypt = require("bcrypt");
const { dataSource } = require("../db/data-source");

const SKILLS = ["肌力訓練", "核心訓練", "有氧體能", "動作矯正", "瑜珈", "壺鈴", "臀腿專項", "運動傷害"];
const PACKAGES = [
  { name: "體驗方案", price: 2400, credit_amount: 4 },
  { name: "標準方案", price: 8800, credit_amount: 16 },
  { name: "年度方案", price: 24000, credit_amount: 48 },
];
const COACHES = [
  ["陳建宏", "chen.jianhong@rfitness.tw", "肌力訓練"],
  ["林雅婷", "lin.yating@rfitness.tw", "核心訓練"],
  ["王柏翔", "wang.boxiang@rfitness.tw", "壺鈴"],
  ["張怡君", "zhang.yijun@rfitness.tw", "臀腿專項"],
  ["李宗翰", "li.zonghan@rfitness.tw", "動作矯正"],
  ["吳佩蓉", "wu.peirong@rfitness.tw", "有氧體能"],
];
const MEMBERS = [
  ["許志豪", "demo.member1@example.com"],
  ...Array.from({ length: 11 }, (_, index) => [
    `示範會員${String(index + 2).padStart(2, "0")}`,
    `demo.member${index + 2}@example.com`,
  ]),
];
const COURSE_SERIES = ["入門體驗", "動作精修", "循環挑戰", "週末專項"];
const COURSE_DESCRIPTIONS = {
  "肌力訓練": [
    "從深蹲、髖鉸鏈與推拉動作開始，建立安全的基礎力量與訓練節奏。",
    "聚焦動作軌跡、發力順序與呼吸控制，細修推、拉與下肢訓練品質。",
    "以複合動作循環提升全身力量與肌耐力，適合想突破訓練停滯的學員。",
    "整合深蹲、推拉與核心穩定，完成一堂兼顧力量與實用性的週末訓練。",
  ],
  "核心訓練": [
    "從腹式呼吸與腹壓控制開始，建立軀幹穩定與正確的核心發力感。",
    "針對骨盆位置、抗旋轉與抗伸展動作，強化核心控制與姿勢穩定。",
    "以多方向核心循環挑戰軀幹耐力，提升跑跳、深蹲與日常動作的支撐力。",
    "結合活動度與核心穩定練習，為週末運動安排打下更穩固的身體基礎。",
  ],
  "有氧體能": [
    "從心肺暖身、步頻與強度控制開始，建立可持續的有氧運動習慣。",
    "透過節奏、姿勢與呼吸調整，提升動作效率與心肺耐力表現。",
    "結合間歇訓練與全身動作，挑戰心肺續航、爆發力與恢復能力。",
    "以全身有氧循環開啟週末，兼顧燃脂、耐力與活動度，找回運動節奏。",
  ],
  "動作矯正": [
    "從常見站姿、肩頸與髖部代償開始評估，練習更舒適的基本動作模式。",
    "針對關節活動度與肌肉控制進行細修，改善深蹲、推拉時的代償習慣。",
    "透過全身整合動作與穩定練習，建立可帶回日常生活的身體控制能力。",
    "用溫和且循序漸進的矯正練習整理身體狀態，為下一週的訓練做好準備。",
  ],
  "壺鈴": [
    "認識壺鈴握法、硬舉與髖鉸鏈，安全建立下肢發力與全身協調基礎。",
    "細修擺盪與架鈴動作，提升髖部爆發力、肩部穩定與節奏控制。",
    "以壺鈴循環結合力量與心肺訓練，挑戰爆發力、抓握力與動作耐力。",
    "整合壺鈴擺盪、深蹲與推舉，完成兼具趣味與強度的週末全身訓練。",
  ],
  "臀腿專項": [
    "從臀橋、深蹲與髖部控制開始，建立臀腿肌群的正確發力感與穩定度。",
    "針對髖、膝與腳踝排列進行動作精修，提升下肢訓練品質與關節控制。",
    "以單腳穩定、蹲舉與髖伸展循環挑戰臀腿肌耐力，打造扎實下肢力量。",
    "整合臀腿力量與活動度訓練，為登山、跑步與日常行走建立更穩定的基礎。",
  ],
};
const password = process.env.DEMO_PASSWORD || "Demo12345";
const now = new Date();
const taipei = new Date(now.getTime() + 8 * 3600000);
const year = taipei.getUTCFullYear();
const month = taipei.getUTCMonth();
const dateAt = (m, day, hour = 12) => new Date(Date.UTC(year, m, day, hour - 8));
function id(key) {
  const h = createHash("sha256").update(`rfitness-demo-v2:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

async function main() {
  await dataSource.initialize();
  const hash = await bcrypt.hash(password, 10);
  const result = await dataSource.transaction(async (db) => {
    // Serialise concurrent seed runs; rollback the entire seed on failure.
    await db.query("SELECT pg_advisory_xact_lock(20260915)");
    async function ensure(entity, key, values, { updateExisting = false } = {}) {
      const repo = db.getRepository(entity);
      const existing = await repo.findOneBy(key);
      if (!existing) return await repo.save(repo.create({ ...values, ...key }));
      return updateExisting ? await repo.save({ ...existing, ...values, ...key }) : existing;
    }
    const skills = {};
    for (const name of SKILLS) skills[name] = await ensure("Skill", { name }, {});
    const packages = [];
    for (const pkg of PACKAGES) packages.push(await ensure("CreditPackage", { name: pkg.name }, pkg));
    for (const [i, [name, email, skill]] of COACHES.entries()) {
      const user = await ensure("User", { email }, { name, password: hash, role: "COACH" });
      const coach = await ensure("Coach", { user_id: user.id }, {
        experience_years: i + 3,
        description: `專注${skill}，以循序漸進的課表陪你建立運動習慣。此為作品展示用教練。`,
        profile_image_url: `/assets/coach-0${i + 1}.png`,
      });
      await ensure("CoachLinkSkill", { coach_id: coach.id, skill_id: skills[skill].id }, {});
    }
    const members = [];
    for (const [name, email] of MEMBERS) {
      members.push(await ensure("User", { email }, {
        name, password: hash, role: "USER",
      }, { updateExisting: true }));
    }
    const coaches = await db.getRepository("Coach").find({ order: { id: "ASC" } });
    // Fund every month's bookings before they occur, using real purchase records.
    const annual = packages[2];
    for (let m = 0; m <= month; m++) {
      for (const user of members) {
        for (let batch = 0; batch < Math.ceil(coaches.length * 2 / annual.credit_amount); batch++) {
          await ensure("CreditPurchase", { id: id(`purchase:${year}:${m}:${user.id}:${batch}`) }, {
            user_id: user.id, credit_package_id: annual.id,
            purchased_credits: annual.credit_amount, price_paid: annual.price, purchase_at: dateAt(m, 1, 8),
          }, { updateExisting: true });
        }
      }
    }
    for (const [index, coach] of coaches.entries()) {
      const link = await db.getRepository("CoachLinkSkill").findOneBy({ coach_id: coach.id });
      const skill = link && await db.getRepository("Skill").findOneBy({ id: link.skill_id }) || skills["肌力訓練"];
      if (!link) await ensure("CoachLinkSkill", { coach_id: coach.id, skill_id: skill.id }, {});
      for (let m = 0; m <= month; m++) {
        for (let slot = 0; slot < 2; slot++) {
          // Keep timestamps within the intended Taipei calendar month when stored as UTC.
          const first = dateAt(m, 1, 8).getTime();
          const span = Math.min(12 * 86400000, (now.getTime() - first) / 2);
          const start = new Date(first + span * (slot + 1) / 3);
          const course = await ensure("Course", { id: id(`history:${year}:${m}:${coach.id}:${slot}`) }, {
            coach_id: coach.id, skill_id: skill.id, name: `${skill.name}・${m + 1}月${slot ? "進階" : "基礎"}班`,
            description: "示範歷史課程：暖身、動作練習與收操，搭配不同程度的訓練安排。",
            start_at: start, end_at: new Date(start.getTime() + Math.min(3600000, span / 6)),
            max_participants: 12, meeting_url: "https://example.com/demo-class",
          }, { updateExisting: true });
          const count = 4 + ((m * 3 + index * 2 + slot) % 8);
          for (let n = 0; n < count; n++) {
            await ensure("CourseBooking", { id: id(`booking:${course.id}:${members[n].id}`) }, {
              course_id: course.id, user_id: members[n].id, created_at: new Date(first + span / 10), cancelled_at: null,
            }, { updateExisting: true });
          }
        }
      }
      // Future dates stay available whenever the demo seed is rerun later.
      for (let slot = 0; slot < 4; slot++) {
        const start = dateAt(month, taipei.getUTCDate() + 2 + slot * 3, 10 + index % 8);
        const series = COURSE_SERIES[slot];
        const description = COURSE_DESCRIPTIONS[skill.name]?.[slot]
          || "依目前體能安排暖身、主題訓練與收操，循序建立安全且可持續的運動習慣。";
        await ensure("Course", { id: id(`upcoming:${coach.id}:${start.toISOString()}`) }, {
          coach_id: coach.id, skill_id: skill.id, name: `${skill.name}・${series}`,
          description,
          start_at: start, end_at: new Date(start.getTime() + 3600000), max_participants: 12,
          meeting_url: "https://example.com/demo-class",
        }, { updateExisting: true });
      }
    }
    return { year, months: month + 1, coaches: coaches.length, members: members.length };
  });
  console.log("Demo seed complete:", JSON.stringify(result));
  console.log("Coach: chen.jianhong@rfitness.tw; member: demo.member1@example.com");
  console.log("New demo accounts use DEMO_PASSWORD (default: Demo12345). Existing passwords are unchanged.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { if (dataSource.isInitialized) await dataSource.destroy(); });
