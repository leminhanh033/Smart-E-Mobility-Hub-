const router=require("express").Router();

router.get("/manage",(req,res)=>{
  res.render("pages/admin/incident-manage",{
    title:"Trang quản lý sự cố",
    activePage:"incident",
  })
})

module.exports=router