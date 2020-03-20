var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session');
// session持久化存储
var redis = require('redis');
const app = express();
const mongoose = require('mongoose');
const dbConfig = require('./server/dbConfig');
const indexRouter = require('./routes/index');
const uploadRouter = require('./routes/upload');

// 相关配置
app.use(logger('dev'));
// 添req.body -> post请求
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

// 创建Redis客户端
var redisClient = redis.createClient(6379, '127.0.0.1');
var RedisStore = require('connect-redis')(session);

// 配置session 存储相关信息
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    // 加密而外信息
    secret: 'express-blog',
    resave: false,
    // 自动初始化一个session钥匙 (sid)
    saveUninitialized: true
  })
);

// 静态资源
app.use('/public', express.static(path.join(__dirname, './public/')));
app.use(
  '/node_modules',
  express.static(path.join(__dirname, './node_modules/'))
);

// 模板引擎
app.engine('html', require('express-art-template'));
app.set('view engine', 'html');
// 设置目录 默认views文件夹
// app.set('views', path.join(__dirname, 'views'));

// 数据库连接 db
mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.db}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 路由
app.use('/', indexRouter);
app.use('/upload', uploadRouter);

// catch 404 and forward to error handler 路由之后 错误处理
app.use(function(req, res, next) {
  next(createError(404)); // -> 进入 err handler (4个参数的中间件)
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

