// entities/Course.js
const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Course",
  tableName: "course",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    coach_id: { type: "uuid", nullable: false },
    skill_id: { type: "uuid", nullable: false },
    name: { type: "varchar", length: 50, nullable: false },
    description: { type: "text", nullable: false },
    start_at: { type: "timestamp", nullable: false },
    end_at: { type: "timestamp", nullable: false },
    max_participants: { type: "integer", nullable: false },
    meeting_url: { type: "varchar", length: 2048, nullable: false },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
  relations: {
    coach: {
      type: "many-to-one",
      target: "Coach", // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { name: "coach_id" }, // ← 對應本表的欄位名
    },
  },
});
