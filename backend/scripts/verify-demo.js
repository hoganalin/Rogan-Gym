const path = require("node:path");
const assert = require("node:assert/strict");
process.chdir(path.resolve(__dirname, ".."));
process.env.DB_SYNCHRONIZE = "false";
const { dataSource } = require("../db/data-source");
const jwt = require("jsonwebtoken");
const config = require("../config");

async function main() {
  await dataSource.initialize();
  const now = new Date(new Date().getTime() + 8 * 3600000);
  const year = now.getUTCFullYear();
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const packages = await dataSource.getRepository("CreditPackage").find();
  assert.equal(packages.length, 3);
  assert.equal(await dataSource.getRepository("Skill").count(), 8);
  const average = packages.reduce((n, p) => n + p.price, 0) / packages.reduce((n, p) => n + p.credit_amount, 0);
  const coaches = await dataSource.getRepository("Coach").find();
  const summary = [];
  for (const coach of coaches) {
    const user = await dataSource.getRepository("User").findOneByOrFail({ id: coach.user_id });
    const token = jwt.sign({ id: user.id }, config.get("secret.jwtSecret"), { expiresIn: "5m" });
    for (let month = 0; month <= now.getUTCMonth(); month++) {
      const [row] = await dataSource.query(`SELECT count(*)::int AS bookings, count(DISTINCT b.user_id)::int AS participants
        FROM course_booking b JOIN course c ON c.id=b.course_id
        WHERE c.coach_id=$1 AND b.cancelled_at IS NULL
        AND EXTRACT(YEAR FROM b.created_at)=$2 AND EXTRACT(MONTH FROM b.created_at)=$3`, [coach.id, year, month + 1]);
      assert(row.participants > 0, `${user.name}: month ${month + 1} missing`);
      const expected = { revenue: Math.floor(row.participants * average), participants: row.participants, course_count: row.bookings };
      if (process.env.VERIFY_API !== "false") {
        const res = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:8080/api"}/coach/revenue?month=${months[month]}`, { headers: { Authorization: `Bearer ${token}` } });
        assert.equal(res.status, 200);
        assert.deepEqual((await res.json()).data.total, expected);
      }
      if (user.email === "chen.jianhong@rfitness.tw") summary.push({ month: month + 1, ...expected });
    }
    const [future] = await dataSource.query("SELECT count(*)::int AS count FROM course WHERE coach_id=$1 AND start_at > NOW()", [coach.id]);
    assert(future.count >= 4);
  }
  const [invalid] = await dataSource.query(`SELECT count(*)::int AS count FROM "user" u
    WHERE u.email LIKE 'demo.member%@example.com' AND
    (SELECT COALESCE(sum(purchased_credits),0) FROM credit_purchases p WHERE p.user_id=u.id)
    < (SELECT count(*) FROM course_booking b WHERE b.user_id=u.id AND b.cancelled_at IS NULL)`);
  assert.equal(invalid.count, 0, "Demo member has negative credits");
  console.table(summary);
  const counts = {};
  for (const entity of ["User", "Coach", "Course", "CourseBooking", "CreditPurchase"]) counts[entity] = await dataSource.getRepository(entity).count();
  console.log(JSON.stringify(counts));
  console.log(`Verified ${coaches.length} coaches × ${now.getUTCMonth() + 1} months; upcoming courses and member credits OK.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { if (dataSource.isInitialized) await dataSource.destroy(); });
