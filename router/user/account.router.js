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
  const oldUserPhone = await usermodel.findOne({
    phone: req.body.phone,
  })
  if (oldUserPhone) {
    res.json({
      code: "error",
      message: "Số điện thoại đã tồn tại",
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

router.post('/change-password', async(req, res) => {
  const emailAccount=await usermodel.findOne({
    email:req.body.phoneEmail,
  })
  if(emailAccount){
    await usermodel.updateOne({
      email:req.body.phoneEmail,
    },{
      password:req.body.newPassword,
    })
    return res.json({
      code:"success",
      message:"Đổi mật khẩu thành công"
    })
  }
  const phoneAccount=await usermodel.findOne({
    phone:req.body.phoneEmail,
  })
  if(phoneAccount){
    await usermodel.updateOne({
      phone:req.body.phoneEmail,
    },{
      password:req.body.newPassword,
    })
    return res.json({
      code:"success",
      message:"Đổi mật khẩu thành công"
    })
  }
  res.json({
    code:"error",
    message:"Không tìm thấy email hoặc số điện thoại",
  })
})

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("login"); 
    return res.json({
      code: "success",
      message: "Đăng xuất tài khoản thành công!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: "error",
      message: "Lỗi hệ thống từ server!",
    });
  }
});

module.exports = router;