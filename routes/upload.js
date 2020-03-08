const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const { uploadPath } = require('../server/config');
const upload = multer({
  dest: path.join(process.cwd(), uploadPath)
});
const { uploadSingle } = require('../utils');

router.get('/:id', (req, res) => {
  res.render('upload', { id: req.params.id });
});

router.post('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const url = await uploadSingle(req);
    await User.updateOne({ _id: req.params.id }, { avatar: url });
    const user = await User.findOne({ _id: req.params.id });
    req.session.user = user;
    res.redirect('../');
  } catch (error) {
    console.log(error);
    res.send(`上传失败 err: ${error}`);
  }
});

module.exports = router;
