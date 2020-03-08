const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const rename = promisify(fs.rename);
const { uploadPath } = require('../server/config');

module.exports = {
  // 封装上传单个文件,
  uploadSingle: async function uploadSingle(req) {
    let extname = path.extname(req.file.originalname);
    let url = path.join(uploadPath, req.file.filename) + extname;
    let newName = path.join(process.cwd(), url);
    console.log(newName);
    await rename(req.file.path, newName);
    return url;
  }
};
