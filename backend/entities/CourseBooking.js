// entities/Course.js
const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "CourseBooking",
  tableName: "course_booking",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid", nullable: false },
    course_id: { type: "uuid", nullable: false },
    cancelled_at: { type: "timestamp", nullable: true },
    created_at: { type: "timestamp", createDate: true },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User", // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { name: "coach_id" }, // ← 對應本表的欄位名
    },
    course: {
      type: "many-to-one",
      target: "Course", // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { name: "course_id" }, // ← 對應本表的欄位名
    },
  },
});
