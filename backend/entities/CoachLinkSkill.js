const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "CoachLinkSkill",
  tableName: "coach_link_skill",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    coach_id: { type: "uuid", nullable: false },
    skill_id: { type: "uuid", nullable: false },
    created_at: { type: "timestamp", createDate: true },
  },
  relations: {
    coach: {
      type: "many-to-one",
      target: "Coach", // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { name: "coach_id" }, // ← 對應本表的欄位名
    },
    skill: {
      type: "many-to-one",
      target: "Skill", // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { name: "skill_id" }, // ← 對應本表的欄位名
    },
  },
});
