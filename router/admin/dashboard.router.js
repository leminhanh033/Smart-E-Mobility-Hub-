const router=require("express").Router();
const hubmodel=require("../../models/hub.model");

router.get("/",async(req,res)=>{
  res.render("pages/admin/dashboard",{
    title:"Trang chủ",
    activePage:"dashboard",
  })
})

router.patch("/hubs/get",async(req,res)=>{
  const hubList=await hubmodel.find({
    turnOn:true,
  }).lean();
  hubList.forEach((hub)=>{
    hub.lat=parseFloat(hub.lat);
    hub.lng=parseFloat(hub.lng);
    hub.parkingUsed=parseInt(hub.parkingUsed);
    hub.ACUsed=parseInt(hub.ACUsed);
    hub.DCUsed=parseInt(hub.DCUsed);
    hub.chargingUsed=hub.ACUsed+hub.DCUsed;
    hub.parkingNumber=parseInt(hub.parkingNumber);
    hub.ACNumber=parseInt(hub.ACNumber);
    hub.DCNumber=parseInt(hub.DCNumber);
  })
  res.json({
    hubList,
  })
})

module.exports=router;