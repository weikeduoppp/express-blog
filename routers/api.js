const express = require("express");
const router = express.Router();
const { query } = require('../server/db')
const dayjs = require('dayjs')
const mysql = require('mysql')


// 获取日期期间的数据
router.get("/get", async (req, res) => {
  let { start, end } = req.query;
  // 转义. 
  let sql = `select Timestamp,Country,Nombor_Whatsapp_Anda,Social_Media,Perkara_yang_Menarik,Nama_di_Media_Sosial,Link_Media_Social_Anda,Harga_Untuk_Periklanan_Anda,Harga_Keseluruhan_Video,Berapa_banyak_peminat_yang_ada_di_media_sosial_anda from questionnaire where Timestamp between ${mysql.escape(start)} and ${mysql.escape(end)};`;
  try {
    const data = await query(sql);
    res.json({
      status: 1,
      data: data.length && data.map((d) => ({
        ...d,
        Timestamp: dayjs(d.Timestamp).format("YYYY-MM-DD HH:mm:ss"),
      })) || [],
    });
  } catch (e) {
    console.log(e)
    res.json({
      status: 0,
    });
  }
});

// 插入
router.post("/submit", async (req, res) => {
  let body = req.body;
  let { keys, values } = Object;
  let key = keys(body).join(',');
  let [Timestamp, ...other] = values(body);
  // 转义 防止sql注入
  const sql = "insert into questionnaire (id,"+ key +") values(null,"+ mysql.escape(Timestamp) +","+ mysql.escape(other)+")"
  try {
    const result = await query(sql);
    res.json({
      status: 1,
      msg: "ok"
    });
  } catch (e) {
    res.json({
      status: 0,
      msg: e
    });
  }
});

module.exports = router;