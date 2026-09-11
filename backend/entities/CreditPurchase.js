const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CreditPurchase",
  tableName: "credit_purchases",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid", nullable: false },
    credit_package_id: { type: "uuid", nullable: false },
    purchased_credits: { type: "integer", nullable: false },
    price_paid: { type: "integer", nullable: false },
    purchase_at: { type: "timestamp", createDate: true },
  },

  relations: {
    user: {
      type: "many-to-one",
      target: "User", // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { name: "user_id" }, // ← 對應本表的欄位名
    },
    credit_package: {
      type: "many-to-one",
      target: "CreditPackage", // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { name: "credit_package_id" }, // ← 對應本表的欄位名
    },
  },
});
