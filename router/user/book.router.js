const router = require('express').Router();
const hubmodel = require("../../models/hub.model");
const parkingBookingModel = require("../../models/booking-parking.model")
const vehicleOwnermodel = require("../../models/vehicleOwner.model");
const chargingDemandModel = require("../../models/charging-demand.model");
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

router.get('/charging/demand', async(req, res) => {
  const hubList=await hubmodel.find({
    status:"active",
  });
  res.render('pages/user/charging-demand', {
    title: "Trang đăng ký nhu cầu sạc",
    activePage: "book",
    hubList,
  })
})

const CHARGING_RATE_AC = 500;   // đ/phút
const CHARGING_RATE_DC = 800;   // đ/phút

router.post("/charging/create", async (req, res) => {
  try {
    // Log body để debug khi cần
    console.log("[charging/create] body:", req.body);

    const {
      vehicleOwnerID,
      hubId,
      desiredPin,
      date,
      time,
      duration,
      portType,
      scheduledStart: scheduledStartRaw,
    } = req.body;

    const userId = req.account ? req.account._id : "6501abc123456789012345";

    // ---------- Validate input cơ bản ----------
    if (!vehicleOwnerID) {
      return res.json({ code: "error", message: "Vui lòng chọn xe cần sạc." });
    }
    if (!hubId) {
      console.log("lỗi");
      return res.json({ code: "error", message: "Vui lòng chọn Mobility Hub." });
    }

    const durationNum = Number(duration);
    if (![45, 60, 120].includes(durationNum)) {
      return res.json({ code: "error", message: "Thời lượng không hợp lệ." });
    }

    // ---------- Compute scheduledStart ----------
    // Ưu tiên client gửi, fallback ghép date + time
    let scheduledStart;
    if (scheduledStartRaw) {
      scheduledStart = new Date(scheduledStartRaw);
    } else if (date && time) {
      scheduledStart = new Date(`${date}T${time}:00`);
    }
    if (!scheduledStart || isNaN(scheduledStart.getTime())) {
      return res.json({ code: "error", message: "Ngày/giờ không hợp lệ." });
    }
    if (scheduledStart < new Date()) {
      return res.json({ code: "error", message: "Không thể đặt lịch trong quá khứ." });
    }

    // ---------- Verify xe ----------
    const vehicle = await vehicleOwnermodel.findOne({
      _id: vehicleOwnerID,
      userID: String(userId),
    });
    if (!vehicle) {
      return res.json({ code: "error", message: "Không tìm thấy xe của bạn." });
    }
    if (vehicle.status === "charging") {
      return res.json({ code: "error", message: "Xe này đang được sạc ở phiên khác." });
    }

    // ---------- Verify hub ----------
    const hub = await hubmodel.findById(hubId);
    if (!hub) {
      return res.json({ code: "error", message: "Không tìm thấy Hub." });
    }
    if (!hub.turnOn) {
      return res.json({ code: "error", message: "Hub hiện không hoạt động." });
    }

    // ---------- Check cổng còn trống ----------
    const isAC = portType === "AC" || !portType;
    const used = isAC ? (hub.ACUsed || 0) : (hub.DCUsed || 0);
    const total = isAC ? (hub.ACNumber || 0) : (hub.DCNumber || 0);
    if (used >= total) {
      return res.json({
        code: "error",
        message: `Hub đã hết cổng ${isAC ? "AC" : "DC"} trống. Vui lòng chọn Hub khác.`,
      });
    }

    // ---------- Check xe chưa có lịch đang chờ / đang sạc ----------
    const existing = await chargingBookingModel.findOne({
      userID: userId,
      vehicleOwnerID,
      status: { $in: ["active", "charging"] },
    });
    if (existing) {
      return res.json({
        code: "error",
        message: "Xe này đã có lịch sạc chưa hoàn thành. Vui lòng hủy trước.",
      });
    }

    // ---------- Tính phí giữ cổng ----------
    // Phí = (giờ hẹn - giờ hiện tại) tính bằng phút × 200đ/phút
    const minutesUntilStart = Math.max(
      0,
      Math.ceil((scheduledStart.getTime() - Date.now()) / 60000)
    );
    const reservationFee = minutesUntilStart * 200;

    // ---------- Tạo booking ----------
    const booking = await chargingBookingModel.create({
      userID: userId,
      vehicleOwnerID,
      hubID: hubId,
      portType: isAC ? "AC" : "DC",
      desiredPin: Number(desiredPin) || 85,
      startPin: vehicle.pin || 20,
      startTime:scheduledStart,
      duration: durationNum,
      reservationFee,
      status: "active",
    });

    // ---------- Reserve cổng ngay khi đặt ----------
    await hubmodel.findByIdAndUpdate(
      hubId,
      isAC ? { $inc: { ACUsed: 1 } } : { $inc: { DCUsed: 1 } }
    );

    // ---------- Response ----------
    const dateStr = scheduledStart.toLocaleDateString("vi-VN");
    const timeStr =
      String(scheduledStart.getHours()).padStart(2, "0") + ":" +
      String(scheduledStart.getMinutes()).padStart(2, "0");

    return res.json({
      code: "success",
      message:
        `Đã đặt lịch sạc lúc ${timeStr} ngày ${dateStr} tại ${hub.name}. ` +
        `Hệ thống sẽ tự khởi động khi tới giờ. ` +
        `Phí giữ cổng: ${reservationFee.toLocaleString("vi-VN")}đ ` +
        `(chờ ${minutesUntilStart} phút × 200đ).`,
      bookingId: booking._id,
      reservationFee,
      minutesUntilStart,
    });
  } catch (err) {
    console.error("Lỗi đăng ký lịch sạc:", err);
    return res.json({ code: "error", message: "Lỗi máy chủ." });
  }
});


// =========================================================
// POST /book/charging/demand — nhận nhu cầu sạc
// =========================================================
router.post('/charging/demand', async (req, res) => {
  try {
    const { hubId } = req.body;
    const userId = req.account ? req.account._id : "6501abc123456789012345";

    if (!hubId) {
      return res.json({ code: "error", message: "Vui lòng chọn Mobility Hub." });
    }

    const hub = await hubmodel.findById(hubId);
    if (!hub) {
      return res.json({ code: "error", message: "Không tìm thấy Hub." });
    }

    // Kiểm tra user đã gửi nhu cầu cho hub này trong 10 phút gần đây chưa
    // (tránh spam click)
    const recent = await chargingDemandModel.findOne({
      userID: userId,
      hubID: hubId,
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (recent) {
      return res.json({
        code: "error",
        message: "Bạn vừa gửi nhu cầu cho Hub này. Vui lòng đợi ít phút.",
      });
    }

    const demand = await chargingDemandModel.create({
      userID: userId,
      hubID: hubId,
      status: "pending",
    });

    return res.json({
      code: "success",
      message: `Đã ghi nhận nhu cầu sạc tại ${hub.name}`,
      demandId: demand._id,
    });
  } catch (err) {
    console.error("Lỗi đăng ký nhu cầu sạc:", err);
    return res.json({ code: "error", message: "Lỗi máy chủ." });
  }
});


module.exports = router;