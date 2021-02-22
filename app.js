var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const apiRouter = require('./routers/api')
const { connection } = require("./server/db")


const app = express();

// 相关配置
app.use(logger('dev'));
// 添req.body -> post请求
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());


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

// 路由
app.use("/", apiRouter);

// 数据库连接
connection.connect((err) => {
  if (err) throw err;
  console.log("mysql is running");
});

connection.end();

// catch 404 and forward to error handler 路由之后 错误处理
app.use(function (req, res, next) {
  next(createError(404)); // -> 进入 err handler (4个参数的中间件)
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
