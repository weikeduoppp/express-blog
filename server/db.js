var env = process.env.NODE_ENV === "production";
const mysql = require('mysql');
let dev = {
  host: "127.0.0.1",
  user:  "yewq",
  password: "123123",
  database: "rotategame", 
  port: 3306,
};

function createConnection() {
  return mysql.createConnection(
    env
      ? {
          host: "127.0.0.1",
          user: "yewq",
          password: "123123",
          database: "rotategame",
          port: 3306,
        }
      : dev
  );
}


function query(sql) {
  let connection = createConnection();
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) reject(err);
    });

    connection.query(sql, (error, result) => {
      if (error) reject(error);
      resolve(result);
      connection.end();
    });
  });
}
// 数据库配置
module.exports = {
  connection: createConnection(),
  createConnection,
  query,
};
