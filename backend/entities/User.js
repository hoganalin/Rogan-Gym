const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "User",
  tableName: "user",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
      //id 這個欄位的值不用你手動塞，資料庫/ORM 自動幫你產生一個 UUID。
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 320,
      nullable: false,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    role: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "USER",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
});
