const router=require("express").Router();
const moment=require("moment");

const hubmodel=require("../../models/hub.model");
const vehiclemodel=require("../../models/vehicle.model");

router.get("/list",async(req,res)=>{
  const hubList=await hubmodel.find({});
  const listVehicles=await vehiclemodel.find({});
  for(const v of listVehicles){
    v.updatedAtFormat=moment(v.updatedAt).format("DD-MM-YYYY");
    
    const hub=await hubmodel.findOne({
      _id:v.hubID,
    })
    v.hubName=hub.name;
    v.pin=Math.floor(Math.random() * (100 - 10 + 1)) + 10;
  }
  res.render("pages/admin/vehicle-list",{
    title:"Trang quản lý xe",
    activePage:"vehicle",
    listVehicles,
    hubList,
  })
})

router.post("/create",async(req,res)=>{
  const newVehicle=new vehiclemodel(req.body);
  await newVehicle.save();
  res.json({
    code:'success',
    message:"Tạo phương tiện mới thành công",
  })
})

router.post("/create", async (req, res) => {
  if (req.body.batteryCapacity < 0) {
    res.json({
      code: "error",
      message: "Dung lượng pin không hợp lệ"
    });
    return;
  }

  const newVehicle = new vehiclemodel(req.body);
  await newVehicle.save();
  
  res.json({
    code: "success",
    message: "Tạo phương tiện mới thành công"
  });
});


router.patch("/edit/get", async (req, res) => {
  const vehicle = await vehiclemodel.findOne({
    _id: req.body.id,
  });
  
  res.json({
    code: "success",
    message: "Lấy thông tin phương tiện thành công",
    vehicle,
  });
});


router.post("/edit", async (req, res) => {
  console.log("Dữ liệu cập nhật:", req.body);
  
  // Kiểm tra dung lượng pin
  if (req.body.batteryCapacity < 0) {
    res.json({
      code: "error",
      message: "Dung lượng pin không hợp lệ"
    });
    return;
  }

  // Cập nhật vào Database
  await vehiclemodel.updateOne({
    _id: req.body.id,
  }, req.body);
  
  res.json({
    code: "success",
    message: "Chỉnh sửa phương tiện thành công",
  });
});

module.exports=router