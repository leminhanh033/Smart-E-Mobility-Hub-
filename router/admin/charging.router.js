const router=require("express").Router();

router.get("/schedule/smart",(req,res)=>{
  res.render("pages/admin/charging-smart",{
    title:"Trang lịch sạc thông minh",
    activePage:"schedule",
  })
})

module.exports=router;