const router=require("express").Router();

router.get("/",(req,res)=>{
  res.render("pages/admin/dispatch",{
    title:"Trang điều phối",
    activePage:"dispatch",
  })
})

module.exports=router;