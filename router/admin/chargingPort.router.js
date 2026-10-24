const router=require("express").Router();
const moment=require("moment");
const hubmodel=require("../../models/hub.model");
const portmodel=require("../../models/chargingPort.model")

router.get("/list",async(req,res)=>{
  const hubList=await hubmodel.find({});
  const listPorts=await portmodel.find({})
  .sort({
    updatedAt:"desc",
  });
  for(const item of listPorts){
    item.updatedAtFormat=moment(item.updatedAt).format("DD-MM-YYYY");
    const hub=await hubmodel.findOne({
      _id:item.hubID,
    })
    item.hubName=hub.name;
  }
  res.render("pages/admin/charging-port-list",{
    title:"Trang quản lý cổng sạc",
    activePage:"charging-port",
    hubList,
    listPorts,
  })
})

router.post("/create",async(req,res)=>{
  if(req.body.power<0){
    res.json({
      code:"error",
      message:"Công suất không hợp lệ"
    })
    return;
  }
  const newPort=new portmodel(req.body);
  await newPort.save();
  res.json({
    code:"success",
    message:"Tạo cổng sạc mới thành công"
  })
})

router.patch("/edit/get",async(req,res)=>{
  const port=await portmodel.findOne({
    _id:req.body.id,
  })
  res.json({
    code:"success",
    message:"Lấy cổng sạc thành công",
    port,
  })
})

router.post("/edit",async(req,res)=>{
  console.log(req.body);
  if(req.body.power<0){
    res.json({
      code:"error",
      message:"Công suất không hợp lệ"
    })
    return;
  }
  await portmodel.updateOne({
    _id:req.body.id,
  },req.body)
  res.json({
    code:"success",
    message:"Chỉnh sửa cổng sạc thành công",
  })
})

module.exports=router;