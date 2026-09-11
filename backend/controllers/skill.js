const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isValidString } = require("../utils/validUtils");

const skillController = {
  async getSkills(req, res, next) {
    //等待資料庫連線成功後，才去找資料所以要使用await
    //取得所有表單資料要使用find()
    const skills = await dataSource.getRepository("Skill").find({
      select: { id: true, name: true },
      order: { created_at: "ASC" },
    });
    res.json({ status: "success", data: skills });
    return;
  },

  async postSkill(req, res, next) {
    //要從body取得資料，使用req.body
    const { name } = req.body;
    if (!isValidString(name)) {
      next(appError(400, "欄位未填寫正確")); //拋送錯誤
      return;
    }
    //從DB找資料
    const skillRepo = dataSource.getRepository("Skill");
    //findOneBy()：找單筆資料，條件是物件格式
    const existing = await skillRepo.findOneBy({ name: name.trim() });
    if (existing) {
      next(appError(409, "資料重複"));
      return;
    }
    //存到資料庫裏面使用語法save()，參數是物件格式
    const skill = await skillRepo.save({ name: name.trim() });
    res.json({ status: "success", data: skill });
  },

  async deleteSkill(req, res, next) {
    try {
      const { skillId } = req.params; //取得id
      const result = await dataSource.getRepository("Skill").delete(skillId);
      //如果刪除的資料筆數是0，表示沒有這個id
      // affected：受影響的資料筆數
      if (result.affected === 0) {
        next(appError(400, "ID錯誤"));
        return;
      }
      res.json({ status: "success" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};
module.exports = skillController;
