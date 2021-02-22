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
  // 转义.
  let sql = `select id,name,num from prize;`;
  try {
    const data = await query(sql);
    const prizes = data.map((d) => d.name);
    let total = data.reduce((a, c) => a.num + c.num);
    // 前边250个抽完后，保证后面50个保证有一个有道翻译王及1个打印机。
    if (total > 50) {
      total = total - 2;
      const prizeNums = data.map((d) => {
        if (d.name === "有道翻译王" || d.name === "有道打印机")
          return (d.num - 1) / total;
        return d.num / total;
      });
    } else {
      const prizeNums = data.map((d) => d.num / total);
    }
    const prize = random(prizes, prizeNums)
    res.json({
      status: 1,
      data: data.find((d) => (d.name = prize)),
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: 0,
    });
  }
});

// 确认领取
router.post("/receive", async (req, res) => {
  let { name, prize_id, vx, key, num } = req.body;
  // 转义.
  let sql = `update collection set name = ${mysql.escape(
    name
  )}, vx = ${mysql.escape(vx)}, prize_id = ${mysql.escape(
    prize_id
  )} where id = ${mysql.escape(key)}`;
  let sql2 = `update prize set num = ${mysql.escape(num)}  where id = ${mysql.escape(prize_id)}`;
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

// 获取日期期间的数据
router.get("/get", async (req, res) => {
  let { start, end } = req.query;
  // 转义.
  let sql = `select Timestamp,Country,Nombor_Whatsapp_Anda,Social_Media,Perkara_yang_Menarik,Nama_di_Media_Sosial,Link_Media_Social_Anda,Harga_Untuk_Periklanan_Anda,Harga_Keseluruhan_Video,Berapa_banyak_peminat_yang_ada_di_media_sosial_anda from questionnaire where Timestamp between ${mysql.escape(
    start
  )} and ${mysql.escape(end)};`;
  try {
    const data = await query(sql);
    res.json({
      status: 1,
      data:
        (data.length &&
          data.map((d) => ({
            ...d,
            Timestamp: dayjs(d.Timestamp).format("YYYY-MM-DD HH:mm:ss"),
          }))) ||
        [],
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: 0,
    });
  }
});

// 插入
router.post("/submit", async (req, res) => {
  let body = req.body;
  let { keys, values } = Object;
  let key = keys(body).join(",");
  let [Timestamp, ...other] = values(body);
  // 转义 防止sql注入
  const sql =
    "insert into questionnaire (id," +
    key +
    ") values(null," +
    mysql.escape(Timestamp) +
    "," +
    mysql.escape(other) +
    ")";
  try {
    const result = await query(sql);
    res.json({
      status: 1,
      msg: "ok",
    });
  } catch (e) {
    res.json({
      status: 0,
      msg: e,
    });
  }
});

module.exports = router;
