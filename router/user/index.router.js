const router = require('express').Router();
const usermodel = require("../../models/user.model")
const parkingBookingModel = require("../../models/booking-parking.model");
const bookingmodel = require("../../models/booking.model");
const chargingBookingModel = require("../../models/booking-charging.model");
const hubmodel = require("../../models/hub.model");
const vehicleOwnerModel = require("../../models/vehicleOwner.model");
const vehiclemodel = require("../../models/vehicle.model");

const CHARGING_RATE_AC = 500;
const CHARGING_RATE_DC = 800;

const accountRouter = require("./account.router");
const bookRouter = require("./book.router")
const sharedVehicleRouter = require("./sharedVehicle.router");
const activityRouter = require("./activity.router");
const reportRouter = require("./report.router");


const checkLogin = async (req, res, next) => {
  if (req.cookies.login) {
    const user = await usermodel.findOne({
      _id: req.cookies.login.id,
    })
    if (user) {
      res.locals.account = user;
      req.account=user;
      next();
      return;
    }
    else {
      res.clearCookie("login");
      res.redirect("/login");
      return;
    }
  }
  else {
    res.redirect("/login");
  }
}

router.use("/", accountRouter);

router.use("/book",checkLogin, bookRouter);

router.use("/shared-vehicle",checkLogin, sharedVehicleRouter);

router.use("/activity",checkLogin, activityRouter);

router.use("/report",checkLogin, reportRouter);

router.get('/', checkLogin, async(req, res) => {
  const hubTotal=await hubmodel.countDocuments({});
  const hubActive=await hubmodel.countDocuments({status:"active"});
  res.render('pages/user/homepage', {
    title: "Trang chủ",
    activePage: "home",
    hubTotal,
    hubActive,
  })
})

setInterval(async () => {
  const now = new Date();

  try {
    // ==========================================
    // 1. XỬ LÝ ĐẶT CHỖ ĐỖ QUÁ HẠN (Quá 60 phút không gửi xe)
    // ==========================================
    const expiredParkings = await parkingBookingModel.find({
      status: 'active',
      bookedAt: { $lt: new Date(now.getTime() - 60 * 60000) } // Đã đặt > 60 phút
    });

    for (let p of expiredParkings) {
      p.status = 'cancelled';
      await p.save();
      
      // Trả lại chỗ trống cho Hub
      await hubmodel.findOneAndUpdate(
        { _id: p.hubID, parkingUsed: { $gt: 0 } },
        { $inc: { parkingUsed: -1 } }
      );
    }

    // ==========================================
    // 2. XỬ LÝ THUÊ XE QUÁ HẠN (Quá 60 phút không nhận xe)
    // ==========================================
    // Giả sử trường holdTime lưu thời điểm hết hạn giữ xe
    const expiredRentals = await bookingmodel.find({
      status: 'active',
      startTime: null,
      createdAt: { $lt: new Date(now.getTime() - 60 * 60000) } 
    });

    for (let r of expiredRentals) {
      r.status = 'cancelled';
      await r.save();
      
      // Trả xe về trạng thái sẵn sàng
      await vehiclemodel.findByIdAndUpdate(r.vehicleID, { status: 'active' });
    }

    // ==========================================
    // 3. XỬ LÝ LỊCH SẠC (Tự động kết thúc khi hết duration)
    // ==========================================
    const activeChargings = await chargingBookingModel.find({ status: 'charging' });

    for (let c of activeChargings) {
      if (!c.startTime) continue;

      const start = new Date(c.startTime).getTime();
      const expectedEnd = new Date(start + c.duration * 60000);
      
      const minutes = Math.max(1, Math.ceil((now.getTime() - start) / 60000));
      const rate = c.portType === "DC" ? CHARGING_RATE_DC : CHARGING_RATE_AC;
      const currentCost = minutes * rate;

      // 3a. Cập nhật chi phí (để Pug hiển thị đúng số tiền)
      c.cost = currentCost;

      // 3b. Nếu đã hết thời gian duration -> Tự động dừng sạc
      if (now >= expectedEnd) {
        c.status = "completed";
        c.endTime = expectedEnd; // Chốt giờ kết thúc đúng hạn
        c.cost = c.duration * rate; // Tính đúng số tiền theo thời lượng đã đặt
        
        // Giải phóng cổng sạc
        const isAC = c.portType === "AC";
        await hubmodel.findOneAndUpdate(
          { _id: c.hubID, ...(isAC ? { ACUsed: { $gt: 0 } } : { DCUsed: { $gt: 0 } }) },
          isAC ? { $inc: { ACUsed: -1 } } : { $inc: { DCUsed: -1 } }
        );

        // Trả xe cá nhân về trạng thái active
        await vehicleOwnerModel.findByIdAndUpdate(c.vehicleOwnerID, { status: "active" });
        
        console.log(`[Cronjob] Tự động kết thúc sạc: ${c._id}`);
      }
      
      await c.save();
    }

  } catch (error) {
    console.error("Lỗi Cronjob tự động:", error);
  }
}, 60000); // 60.000 ms = 1 phút



module.exports = router;