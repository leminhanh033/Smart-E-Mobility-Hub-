const router=require("express").Router();

router.get('/login', (req, res) => {
  res.render('pages/admin/login',{
    title:"Trang đăng nhập"
  })
})

router.get('/reset-password', (req, res) => {
  res.render('pages/admin/reset-password',{
    title:"Trang nhập lại mật khẩu"
  })
})

module.exports=router;