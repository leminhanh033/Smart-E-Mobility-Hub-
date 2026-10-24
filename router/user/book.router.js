const router = require('express').Router();
const hubmodel = require("../../models/hub.model");
const parkingBookingModel = require("../../models/booking-parking.model")
const vehicleOwnermodel = require("../../models/vehicleOwner.model");
const chargingBookingModel=require("../../models/booking-charging.model")
router.get('/parking', async (req, res) => {
  const desID = req.query.destinationId;
  const filter = {
    status: "active",
  };
  const hubList = await hubmodel.find(filter)
  res.render('pages/user/book-parking', {
    title: "Trang đặt chỗ đỗ",
    activePage: "book",
    hubList,
    desID,
  })
})

router.post('/parking/create', async (req, res) => {
  try {
    const { hubId } = req.body;

    // Giả lập user ID (nếu chưa có session đăng nhập)
    const userId = req.account ? req.account._id : "6501abc123456789";

    if (!hubId) {
      return res.json({ code: "error", message: "Vui lòng chọn Hub!" });
    }

    // 1. Tìm Hub để kiểm tra chỗ trống
    const hub = await hubmodel.findById(hubId);
    if (!hub) {
      return res.json({ code: "error", message: "Không tìm thấy Hub này!" });
    }

    const availableSlots = (hub.parkingNumber || 0) - (hub.parkingUsed || 0);
    if (availableSlots <= 0) {
      return res.json({ code: "error", message: "Hub này đã hết chỗ đỗ!" });
    }

    // 2. Cập nhật số chỗ đã dùng (tăng lên 1)
    hub.parkingUsed = (hub.parkingUsed || 0) + 1;
    await hub.save();

    // 4. Tạo bản ghi lịch sử đặt chỗ
    const newBooking = new parkingBookingModel({
      userID: userId,
      hubID: hub._id,
      slotCode: req.body.slotCode,
      status: 'active'
    });
    await newBooking.save();

    // 5. Trả về thành công
    return res.json({
      code: "success",
      message: "Đặt chỗ đỗ thành công!",
      bookingId: newBooking._id
    });

  } catch (error) {
    console.error("Lỗi đặt chỗ:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống, vui lòng thử lại!" });
  }
});

router.get('/charging/schedule', async (req, res) => {
  const userId = req.account ? req.account._id : "6501abc123456789"; // Lấy ID user

  const listVehicles = await vehicleOwnermodel.find({ userID: userId }).lean();
  // Lấy danh sách Hub
  const hubList = await hubmodel.find({ status: "active" }).lean();
  res.render('pages/user/schedule-charging', {
    title: "Trang đặt lịch sạc",
    activePage: "book",
    hubList,
    listVehicles,
  })
})

router.post('/charging/create', async (req, res) => {
  try {
    const { vehicleID, hubId, desiredPin, date, time, duration, portType } = req.body;
    const userId = req.user ? req.user._id : "6501abc123456789";

    // 1. Kiểm tra Hub có tồn tại không
    const hub = await hubmodel.findById(hubId);
    if (!hub) {
      return res.json({ code: "error", message: "Không tìm thấy Hub!" });
    }

    // 2. Kiểm tra số lượng cổng trống (AC hoặc DC)
    let availablePorts = 0;

    if (portType === 'DC') {
      availablePorts = (hub.DCNumber || 0) - (hub.DCUsed || 0);
      if (availablePorts <= 0) {
        return res.json({ code: "error", message: "Rất tiếc, Hub này đã hết cổng sạc DC!" });
      }
      // Cập nhật số cổng DC đã dùng
      hub.DCUsed = (hub.DCUsed || 0) + 1;
    } else {
      availablePorts = (hub.ACNumber || 0) - (hub.ACUsed || 0);
      if (availablePorts <= 0) {
        return res.json({ code: "error", message: "Rất tiếc, Hub này đã hết cổng sạc AC!" });
      }
      // Cập nhật số cổng AC đã dùng
      hub.ACUsed = (hub.ACUsed || 0) + 1;
    }

    // Lưu lại số lượng cổng đã dùng vào DB
    await hub.save();

    // 3. Tạo lịch sạc mới
    const startTime = new Date(`${date}T${time}:00`);
    const cost = parseInt(duration) * 500; // Giả sử 500đ / phút

    const newBooking = new chargingBookingModel({
      userID: userId,
      vehicleID: vehicleID,
      hubID: hubId,
      portType: portType, // Lưu lại AC hay DC
      desiredPin: parseInt(desiredPin),
      startTime,
      duration: parseInt(duration),
      cost,
      date,
      time,
      status: 'active'
    });

    await newBooking.save();

    return res.json({
      code: "success",
      message: `Đăng ký cổng ${portType} thành công!`
    });

  } catch (error) {
    console.error("Lỗi đăng ký lịch sạc:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống, vui lòng thử lại!" });
  }
});

router.post('/vehicle/owner/create', async (req, res) => {
  try {
    const { license, type, model, batteryCapacity } = req.body;
    const userId = req.account ? req.account._id : "6501abc123456789"; // Lấy ID user đang đăng nhập

    const newOwner = new vehicleOwnermodel({
      userID: userId,
      license,
      type,
      model,
      batteryCapacity: parseFloat(batteryCapacity),
    });
    await newOwner.save();

    return res.json({ code: "success", message: "Thêm phương tiện thành công!" });
  } catch (error) {
    console.error("Lỗi thêm xe:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống, vui lòng thử lại!" });
  }
})

router.get('/charging/demand', (req, res) => {
  res.render('pages/user/charging-demand', {
    title: "Trang đăng ký nhu cầu sạc",
    activePage: "book",
  })
})


module.exports = router;