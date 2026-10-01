const { DataSource } = require("typeorm");
const config = require("../config");
const User = require("../entities/User");
const Skill = require("../entities/Skill");
const Coach = require("../entities/Coach");
const CoachLinkSkill = require("../entities/CoachLinkSkill");
const CreditPackage = require("../entities/CreditPackage");
const Course = require("../entities/Course");
const CourseBooking = require("../entities/CourseBooking");
const CreditPurchase = require("../entities/CreditPurchase");

const dataSource = new DataSource({
  type: "postgres",
  host: config.get("db.host"),
  port: config.get("db.port"),
  username: config.get("db.username"),
  password: config.get("db.password"),
  database: config.get("db.database"),
  synchronize: config.get("db.synchronize"),
  ssl: config.get("db.ssl"),
  // Timestamp columns have no timezone. Their database defaults must use the
  // same wall clock as Node/pg, including at month and year boundaries.
  extra: {
    options: `-c timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
  },
  entities: [
    User,
    Skill,
    Coach,
    CoachLinkSkill,
    CreditPackage,
    Course,
    CourseBooking,
    CreditPurchase,
  ], //有哪些entities 要使用要寫進來
});
module.exports = { dataSource };
