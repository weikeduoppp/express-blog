const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const rename = promisify(fs.rename);
const uploadPath = "../public/upload";
require("es6-promise").polyfill();

const fetch = require("isomorphic-fetch");

function random(arr1, arr2) {
    var sum = 0,
        factor = 0,
        random = Math.random();

    for(var i = arr2.length - 1; i >= 0; i--) {
        sum += arr2[i]; // 统计概率总和
    };
    random *= sum; // 生成概率随机数
    for(var i = arr2.length - 1; i >= 0; i--) {
        factor += arr2[i];
        if(random <= factor) 
          return arr1[i];
    };
    return null;
};

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
  // 抽奖
  random,
};
