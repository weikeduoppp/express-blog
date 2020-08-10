const express = require('express');
const router = express.Router();
const User = require('../models/user');
const md5 = require('blueimp-md5');


// 登录页面
router.get('/temp', (req, res) => {
  res.render("temp", {
    title: "0元領取3節編程課程",
    btn_text: "馬上0元領取",
    gtag_label: "NYK2CP3EjNkBEM7aoKIC",
    gtagid: "AW-608709966",
    paramList: "lpid=22136&ext=__LANDINGPAGE_EXT__"
  });
});


// 首页
router.get('/', (req, res) => {
  console.log(req.session.user);
  res.render('index', {
    user: req.session.user,
    content: 'who?'
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
      $or: [{ nickname: body.nickname }, { email: body.email }]
    });
    if (data) {
      let err_code = data.email === body.email ? 1 : 2;
      // 邮箱或用户名已存在
      res.status(200).json({
        err_code,
        msg: 'Mailbox or user name already exists'
      });
    } else {
      let user = await User.create({
        ...body,
        password: md5(md5(body.password))
      });
      req.session.user = user;
      // 注册成功
      res.status(200).json({
        err_code: 0,
        msg: 'success register'
      });
    }
  } catch (error) {
    res.status(500).json({
      err_code: 500,
      msg: 'server error'
    });
  }
});

module.exports = router;
