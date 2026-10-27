const router = require('express').Router();
const hubmodel=require("../../models/hub.model");
const vehiclemodel=require("../../models/vehicle.model");
const bookingmodel=require("../../models/booking.model")

router.get('/book', async (req, res) => {
  const hubList = await hubmodel.find({
    turnOn: true,
  })
  let listVehicle=[];
  if(req.query.fromID){
    listVehicle=await vehiclemodel.find({
      hubID:req.query.fromID,
      status:"active",
    })
  }
  listVehicle.forEach(item=>{
    item.pin = Math.floor(Math.random() * (100 - 50 + 1)) + 50; 
  })
  res.render('pages/user/book-shared-vehicle', {
    title: "Trang đặt xe",
    activePage: "find-vehicle",
    hubList,
    listVehicles:listVehicle,
  })
})

router.get('/book/confirm', (req, res) => {
  res.render('pages/user/confirm-vehicle', {
    title: "Trang xác nhận đặt xe",
    activePage: "find-vehicle",
  })
})

router.get('/return/confirm', (req, res) => {
  res.render('pages/user/confirm-return', {
    title: "Trang xác nhận trả xe",
    activePage: "activity",
  })
})

router.get('/detail', async(req, res) => {
  const id=req.query.vehicleID;
  let vehicle={};
  if(id){
    vehicle=await vehiclemodel.findOne({
      _id:id,
    })
  }
  const hub=await hubmodel.findOne({
    _id:vehicle.hubID,
  })
  vehicle.pin = vehicle.pin || Math.floor(Math.random() * 51) + 50; // Từ 50-100%
  vehicle.estimatedRange = Math.round(vehicle.pin * 0.5); // Giả sử 1% pin đi được 0.5km
  vehicle.parkingSlot = "A-84"; 
  vehicle.distanceToUser = "120 m (~2 phút đi bộ)"; 

  res.render('pages/user/shared-vehicle-detail', {
    title: "Trang chi tiết xe",
    activePage: "find-vehicle",
    hub,
    vehicle
  })
})

router.post("/booking/create", async (req, res) => {
  try {
    const { vehicleId } = req.body;

    const vehicle = await vehiclemodel.findById(vehicleId);
    if (!vehicle) {
      return res.json({ code: "error", message: "Không tìm thấy xe!" });
    }
    console.log(vehicle);
    if (vehicle.status !== 'active') {
      return res.json({ code: "error", message: "Xe này hiện đã có người đặt hoặc đang bảo trì!" });
    }

    vehicle.status = "used"; 
    await vehicle.save();

    const newBooking = new bookingmodel({
      vehicleID: vehicleId,
      userID: req.account ? req.account._id : "6501...",
      status: "active",
      startHubID:vehicle.hubID,
      endHubID:req.body.endHubID,
    });
    await newBooking.save();

    return res.json({
      code: "success",
      message: "Đặt xe thành công! Vui lòng đến nhận xe.",
      bookingId: newBooking._id
    });

  } catch (error) {
    console.error("Lỗi khi đặt xe:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống!" });
  }
});


module.exports = router;