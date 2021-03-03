const express = require("express");
const router = express.Router();
const { query } = require("../server/db");
const dayjs = require("dayjs");
const mysql = require("mysql");
const { random } = require("../utils");

// 剩余奖品
router.get("/prize", async (req, res) => {
  // 转义.
  let sql = `select id,name,num from prize;`;
  try {
    const data = await query(sql);
    res.json({
      status: 1,
      data,
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: 0,
    });
  }
});

// 领取信息
router.get("/collection", async (req, res) => {
  // 转义.
  let sql = `select a.id,a.name,a.vx,a.receive_time,b.name prize_name from collection a left join prize b on a.prize_id = b.id;`;
  try {
    const data = await query(sql);
    res.json({
      status: 1,
      data,
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: 0,
    });
  }
});

// 领取
router.get("/receive", async (req, res) => {
  let { id } = req.query;
  let checkSql = `select prize_id from collection where id = ${mysql.escape(
    id
  )};`;
  // 转义.
  let sql = `select id,name,num from prize;`;
  try {
    const [{ prize_id }] = await query(checkSql);
    // 检测是否已被领取
    if (!prize_id) {
      const data = await query(sql);
      const prizes = data.map((d) => d.name);
      let total = data.reduce((a, c) => a + c.num, 0);
      console.log(total);
      let prizeNums;
      // 前边250个抽完后，保证后面50个保证有一个有道翻译王及1个打印机。
      if (total > 50) {
        total = total - 2;
        prizeNums = data.map((d) => {
          if (d.name === "有道翻译王" || d.name === "有道打印机")
            return (d.num - 1) / total;
          return d.num / total;
        });
      } else {
        prizeNums = data.map((d) => d.num / total);
      }
      const prize = random(prizes, prizeNums);
      res.json({
        status: 1,
        data: data.find((d) => d.name === prize),
      });
    } else {
      res.json({
        status: 0,
        msg: "此链接已被领取~,请联系相应客服",
      });
    }
  } catch (e) {
    console.log(e);
    res.json({
      status: 0,
      msg: "服务繁忙, 稍后再试!",
    });
  }
});

// 确认领取
router.post("/receive", async (req, res) => {
  let { name, prize_id, vx, key } = req.body;
  const [{ num }] = await query(
    `select num from prize where id = ${mysql.escape(prize_id)}`
  );
  // 转义.
  let sql = `update collection set name = ${mysql.escape(
    name
  )}, vx = ${mysql.escape(vx)}, prize_id = ${mysql.escape(
    prize_id
  )} where id = ${mysql.escape(key)}`;
  let sql2 = `update prize set num = ${num - 1}  where id = ${mysql.escape(
    prize_id
  )}`;
  try {
    await query(sql);
    await query(sql2);
    res.json({
      status: 1,
      data: "ok",
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: 0,
    });
  }
});

module.exports = router;
