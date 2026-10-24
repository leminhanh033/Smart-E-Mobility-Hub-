const router=require("express").Router();
const hubmodel=require("../../models/hub.model");


router.get("/list",async(req,res)=>{
  const listHub=await hubmodel.find({});
  listHub.forEach(hub=>{
    hub.parkingUsed=parseInt(hub.parkingUsed);
    hub.ACUsed=parseInt(hub.ACUsed);
    hub.DCUsed=parseInt(hub.DCUsed);
    hub.chargingUsed=hub.ACUsed+hub.DCUsed;
    hub.parkingNumber=parseInt(hub.parkingNumber);
    hub.ACNumber=parseInt(hub.ACNumber);
    hub.DCNumber=parseInt(hub.DCNumber);
  })
  res.render("pages/admin/hub-list",{
    title:"Trang quản lý Hub",
    activePage:"hub",
    listHub,
  })
})

router.post("/create",async(req,res)=>{
  req.body.status="inactive",
  req.body.parkingUsed=0;
  req.body.DCUsed=0;
  req.body.ACUsed=0;
  req.body.turnOn=true;

  const [lat,lng]=req.body.gps.split(",");
  req.body.lat=parseFloat(lat)
  req.body.lng=parseFloat(lng)
  
  const newhub=new hubmodel(req.body);
  await newhub.save();
  res.json({
    code:"success",
    message:"Tạo Hub mới thành công"
  })
  
})

router.patch("/turn",async(req,res)=>{
  const hub=await hubmodel.findOne({
    _id:req.body.id
  })
  hub.turnOn=!hub.turnOn;
  await hubmodel.updateOne({
    _id:req.body.id
  },hub);
  res.json({
    code:"success",
    message:"Chỉnh sửa thành công"
  })
  
})

router.patch(`/get/:id`,async(req,res)=>{
  const hub=await hubmodel.findOne({
    _id:req.params.id
  });
  res.json({
    hub,
  })
  
})


router.post("/edit",async(req,res)=>{
  // req.body.status="inactive",
  // req.body.parkingUsed=0;
  // req.body.DCUsed=0;
  // req.body.ACUsed=0;
  // req.body.turnOn=true;
  const hub=await hubmodel.findOne({
    _id:req.body.id,
  })
  hub.hubID=req.body.hubID;
  hub.name=req.body.name;
  hub.address=req.body.address;
  hub.gps=req.body.gps;
  hub.status=req.body.status;
  hub.parkingNumber=req.body.parkingNumber;
  hub.ACNumber=req.body.ACNumber;
  hub.DCNumber=req.body.DCNumber;
  const [lat,lng]=req.body.gps.split(",");
  hub.lat=parseFloat(lat)
  hub.lng=parseFloat(lng)
  
  await hubmodel.updateOne({
    _id:req.body.id
  },hub);
  res.json({
    code:"success",
    message:"Chỉnh sửa thành công"
  })
  
})


module.exports=router;