const router = require('express').Router();
const usermodel = require("../../models/user.model")

router.get('/login', (req, res) => {
  res.render('pages/user/login', {
    title: "Trang đăng nhập"
  })
})

router.get('/register', (req, res) => {
  res.render('pages/user/register', {
    title: "Trang đăng ký"
  })
})

router.post('/register', async (req, res) => {
  const oldUser = await usermodel.findOne({
    email: req.body.email,
  })
  if (oldUser) {
    res.json({
      code: "error",
      message: "Email đã tồn tại",
    })
    return;
  }
  const newUser = new usermodel(req.body);
  await newUser.save();
  res.json({
    code: "success",
    message: "Đăng ký thành công"
  })
})

router.post('/login', async (req, res) => {
  const user = await usermodel.findOne({
    email: req.body.email,
  })
  if (!user) {
    res.json({
      code: "error",
      message: "Email không tồn tại",
    })
    return;
  }
  if (user.password != req.body.password) {
    res.json({
      code: "error",
      message: "Mật khẩu không chính xác",
    })
    return;
  }
  res.cookie('login', {
    id:user._id,
    fullname:user.fullname,
  }, { maxAge:24*60*60*1000 });
  res.json({
    code: "success",
    message: "Đăng nhập thành công"
  })
})

router.get('/reset-password', (req, res) => {
  res.render('pages/user/reset-password', {
    title: "Trang đặt lại mật khẩu"
  })
})

module.exports = router;