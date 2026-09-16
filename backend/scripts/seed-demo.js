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
            purchased_credits: annual.credit_amount, price_paid: annual.price, purchase_at: dateAt(m, 1, 0),
          });
        }
      }
    }
    for (const [index, coach] of coaches.entries()) {
      const link = await db.getRepository("CoachLinkSkill").findOneBy({ coach_id: coach.id });
      const skill = link && await db.getRepository("Skill").findOneBy({ id: link.skill_id }) || skills["肌力訓練"];
      if (!link) await ensure("CoachLinkSkill", { coach_id: coach.id, skill_id: skill.id }, {});
      for (let m = 0; m <= month; m++) {
        for (let slot = 0; slot < 2; slot++) {
          const first = dateAt(m, 1, 0).getTime();
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
            });
          }
        }
      }
      // Future dates stay available whenever the demo seed is rerun later.
      for (let slot = 0; slot < 4; slot++) {
        const start = dateAt(month, taipei.getUTCDate() + 2 + slot * 3, 10 + index % 8);
        await ensure("Course", { id: id(`upcoming:${coach.id}:${start.toISOString()}`) }, {
          coach_id: coach.id, skill_id: skill.id, name: `${skill.name}・${["入門體驗", "動作精修", "循環挑戰", "週末專項"][slot]}`,
          description: "作品展示課程。包含暖身、主題訓練與伸展收操，可依個人體能調整強度；請備妥飲水與毛巾。",
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
