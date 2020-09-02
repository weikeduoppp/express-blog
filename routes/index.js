const express = require('express');
const router = express.Router();
const User = require('../models/user');
const md5 = require('blueimp-md5');
const { request: api } = require('../utils');

// 最后测试页面
router.get('/last', async (req, res) => {
  res.render('last', {
    title: '0元領取129元直播課',
    btn_text: '馬上0元領取',
    success_text: '領取成功！請等候老師聯繫您！',
    gtag_label: '-CuKCP3gm9kBEKTe56IC',
    gtagid: 'AW-609873700',
    paramList: 'lpid=23012&ext=__LANDINGPAGE_EXT__',
    top_img: '/public/top.jpg',
    bottom_img: '/public/bottom.jpg',
  });
});

// analytics
router.get('/analytics', async (req, res) => {
  res.render('analytics', {
    title: '0元領取129元直播課',
    btn_text: '馬上0元領取',
    success_text: '領取成功！請等候老師聯繫您！',
    gtag_label: '-CuKCP3gm9kBEKTe56IC',
    gtagid: 'AW-609873700',
    paramList: 'lpid=23012&ext=__LANDINGPAGE_EXT__',
    top_img: '/public/top.jpg',
    bottom_img: '/public/bottom.jpg',
  });
});

// 登录页面
router.get('/refresh', async (req, res) => {
  await fetch();
  res.render('temp', {
    title: '0元領取3節編程課程',
    btn_text: '馬上0元領取',
    gtag_label: 'NYK2CP3EjNkBEM7aoKIC',
    gtagid: 'AW-608709966',
    paramList: 'lpid=22136&ext=__LANDINGPAGE_EXT__',
    top_img: 'https://download.ydstatic.com/ead/kada_top_img.jpg',
    bottom_img: 'https://download.ydstatic.com/ead/kada_bottom_img.jpg',
  });
});

// 动态路由
async function fetch() {
  const data = await api.get('https://c.youdao.com/dsp/google_ads.json');
  console.log(data);
  return await Promise.all(
    data.map((d) => {
      router.get(`/${d.url}`, async (req, res) => {
        if (d.template === 'temp') {
          res.render(`${d.template}`, {
            title: d.title,
            btn_text: d.btn_text,
            gtag_label: d.gtag_label,
            gtagid: d.gtagid,
            paramList: d.paramList,
            top_img: d.top_img,
            bottom_img: d.bottom_img,
          });
        } else {
          console.log(d.url);
          res.render(`${d.template}`, {
            title: d.title,
            btn_text: d.btn_text,
            gtag_label: d.gtag_label,
            gtagid: d.gtagid,
            paramList: d.paramList,
            top_img: d.top_img,
            bottom_img: d.bottom_img,
            active_url: d.active_url,
          });
        }
      });
    })
  );
}

fetch();

// 首页
router.get('/', (req, res) => {
  console.log(req.session.user);
  res.render('index', {
    user: req.session.user,
    content: 'who?',
  });
});

// 登录页面
router.get('/login', (req, res) => {
  res.render('login');
});

// 设置页码
router.get('/settings/profile', (req, res) => {
  res.render('settings/profile', { user: req.session.user });
});

// 注册页面
router.get('/register', (req, res) => {
  res.render('register');
});

// 注册
router.post('/register', async (req, res, next) => {
  /* 
    1. 判断邮箱或用户名是否重复 
    2. 数据库查询 findOne, $or
    3. 成功 -> 保存数据库 密码MD5双加密
    4. 返回 -> json字符串  ->  res.json: 自动处理json数据 JSON.stringify()
  */
  let body = req.body;
  try {
    let data = await User.findOne({
      $or: [{ nickname: body.nickname }, { email: body.email }],
    });
    if (data) {
      let err_code = data.email === body.email ? 1 : 2;
      // 邮箱或用户名已存在
      res.status(200).json({
        err_code,
        msg: 'Mailbox or user name already exists',
      });
    } else {
      let user = await User.create({
        ...body,
        password: md5(md5(body.password)),
      });
      req.session.user = user;
      // 注册成功
      res.status(200).json({
        err_code: 0,
        msg: 'success register',
      });
    }
  } catch (error) {
    res.status(500).json({
      err_code: 500,
      msg: 'server error',
    });
  }
});

module.exports = router;
