const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const rename = promisify(fs.rename);
const { uploadPath } = require("../server/config");
require("es6-promise").polyfill();

const fetch = require("isomorphic-fetch");

module.exports = {
  // 封装上传单个文件,
  uploadSingle: async function uploadSingle(req) {
    let extname = path.extname(req.file.originalname);
    let url = path.join(uploadPath, req.file.filename) + extname;
    let newName = path.join(process.cwd(), url);
    console.log(newName);
    await rename(req.file.path, newName);
    return url;
  },
  request: {
    get: function (url, params) {
      return new Promise((resolve, reject) => {
        if (params) {
          let paramsArray = [];
          //拼接参数
          Object.keys(params).forEach((key) =>
            paramsArray.push(key + "=" + params[key])
          );
          if (url.search(/\?/) === -1) {
            url += "?" + paramsArray.join("&");
          } else {
            url += "&" + paramsArray.join("&");
          }
        }
        fetch(url, {
          method: "GET",
        })
          .then((res) => res.json())
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    post: function (url, params) {
      return new Promise((resolve, reject) => {
        fetch(url, {
          method: "POST",
          body: JSON.stringify(params),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
};
