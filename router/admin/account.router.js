const Admin=require("../../models/admin.model")
const router = require("express").Router();

router.get('/login', (req, res) => {
  res.render('pages/admin/login', {
    title: "Trang đăng nhập"
  })
})

router.get('/reset-password', (req, res) => {
  res.render('pages/admin/reset-password', {
    title: "Trang nhập lại mật khẩu"
  })
})

router.post('/login', async (req, res) => {
  try {
    const { phoneEmail, password } = req.body;

    if (!phoneEmail || !password) {
      return res.json({
        code: 'error',
        message: 'Vui lòng nhập đầy đủ Số điện thoại/Email và Mật khẩu',
      });
    }

    const identifier = phoneEmail;

    const admin = await Admin.findOne({
      $or: [
        { email: identifier},
        { phone: identifier },
      ],
    });

    if (!admin) {
      return res.json({
        code: 'error',
        message: 'Số điện thoại/Email hoặc mật khẩu không chính xác',
      });
    }

    if (!admin.isActive) {
      return res.json({
        code: 'error',
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      });
    }

    if (password !== admin.password) {
      return res.json({
        code: 'error',
        message: 'Số điện thoại/Email hoặc mật khẩu không chính xác',
      });
    }

    res.cookie('login', {
      id: admin._id,
      fullname: admin.fullname,
      role: admin.role,
    }, {
      maxAge: 24 * 60 * 60 * 1000, 
      httpOnly: true,
      sameSite: 'strict',
    });

    return res.json({
      code: 'success',
      message: 'Đăng nhập thành công',
    });
  } catch (error) {
    console.error('Lỗi đăng nhập admin:', error);
    return res.status(500).json({
      code: 'error',
      message: 'Lỗi hệ thống, vui lòng thử lại sau',
    });
  }
});


//Đăng xuất
router.post("/logout",(req,res)=>{
  res.clearCookie("login",{
    httpOnly: true,
    sameSite: "strict",
  });
  return res.json({
    code: "success",
    message: "Đăng xuất thành công",
  });
});

//thay đổi mật khẩu
router.post('/change-password', async(req, res) => {
  const emailAccount=await Admin.findOne({
    email:req.body.phoneEmail,
  })
  if(emailAccount){
    await Admin.updateOne({
      email:req.body.phoneEmail,
    },{
      password:req.body.newPassword,
    })
    return res.json({
      code:"success",
      message:"Đổi mật khẩu thành công"
    })
  }
  const phoneAccount=await Admin.findOne({
    phone:req.body.phoneEmail,
  })
  if(phoneAccount){
    await Admin.updateOne({
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

//gửi otp
router.post('/send-otp', async(req, res) => {
  const emailAccount=await Admin.findOne({
    email:req.body.phoneEmail,
  })
  if(emailAccount){
    return res.json({
      code:"success",
      message:"Đã gửi mã otp vào số điện thoại"
    })
  }
  const phoneAccount=await Admin.findOne({
    phone:req.body.phoneEmail,
  })
  if(phoneAccount){
    return res.json({
      code:"success",
      message:"Đã gửi mã otp vào email thành công"
    })
  }
  res.json({
    code:"error",
    message:"Không tìm thấy email hoặc số điện thoại",
  })
})

module.exports = router;