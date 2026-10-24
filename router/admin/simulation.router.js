const router=require("express").Router();

router.get("/demand/surging",(req,res)=>{
  res.render("pages/admin/simulation-demand-surging",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})

router.get("/full/parking",(req,res)=>{
  res.render("pages/admin/simulation-full-parking",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})

router.get("/charging/surge",(req,res)=>{
  res.render("pages/admin/simulation-charging-surge",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})

router.get("/charging/point/failure",(req,res)=>{
  res.render("pages/admin/simulation-charging-failure",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})

router.get("/vehicle/concentration",(req,res)=>{
  res.render("pages/admin/simulation-concentration",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})


module.exports=router;