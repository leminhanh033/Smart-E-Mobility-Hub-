const router = require('express').Router();
const hubmodel=require("../../models/hub.model")
const bookingmodel = require("../../models/booking.model");
const parkingBookingModel = require("../../models/booking-parking.model")
const chargingBookingModel = require("../../models/booking-charging.model")
const vehiclemodel=require("../../models/vehicle.model")
const moment=require("moment")
router.get('/active', async (req, res) => {
  try {
    const userId = req.account ? req.account._id : "6501abc123456789";

    // 1. Lấy danh sách Thuê xe (Đang active)
    const rentals = await bookingmodel.find({ userID: userId, status: 'active' })
      .populate("vehicleID")    // Lấy tên xe, biển số
      .populate("startHubID")   // Lấy tên Hub bắt đầu
      .populate("endHubID")     // Lấy tên Hub kết thúc
      .lean();

    // 2. Lấy danh sách Đặt chỗ đỗ (Đang active)
    const parkings = await parkingBookingModel.find({ userID: userId, status: 'active' })
      .populate("hubID")        // Lấy tên Hub
      .lean();

    // 3. Lấy danh sách Đăng ký sạc (Đang active)
    const chargings = await chargingBookingModel.find({ userID: userId, status: 'active' })
      .populate("hubID")        // Lấy tên Hub
      .lean();

    // 4. Gộp chung và gắn thêm trường 'type' để Pug phân biệt
    let allActivities = [];
    for( const item of rentals) {
      if (item.vehicleID) {
        item.vehicleID.pin = Math.floor(Math.random() * 51) + 20; 
      }
      const hub=await hubmodel.findOne({
        _id:item.endHubID,
      })
      item.hubName=hub.name
      allActivities.push({ ...item, type: 'rental' });
    };

    parkings.forEach(item => allActivities.push({ ...item, type: 'parking' }));
    chargings.forEach(item => allActivities.push({ ...item, type: 'charging' }));

    // 5. Sắp xếp theo thời gian tạo mới nhất (mới nhất lên đầu)
    allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 6. Render ra Pug
    res.render("pages/user/activity-active", {
      title: "Hoạt động của tôi",
      activePage: "activity",
      activities: allActivities
    });
  } catch (error) {
    console.error("Lỗi lấy hoạt động:", error);
    res.status(500).send("Lỗi Server");
  }
})
router.post('/cancel', async (req, res) => {
  try {
    const { id, type } = req.body;
    const userId = req.account ? req.account._id : "6501abc123456789";

    if (!id) {
      return res.json({ code: "error", message: "Thiếu ID cần hủy!" });
    }
    console.log(id,type)

    // 1. NẾU LÀ HỦY THUÊ XE (RENTAL)
    if (type === 'rental') {
      const booking = await bookingmodel.findOne({ _id: id, userID: userId });
      
      if (!booking) return res.json({ code: "error", message: "Không tìm thấy lịch sử thuê!" });
      if (booking.endTime) return res.json({ code: "error", message: "Bạn đã nhận xe rồi, không thể hủy lúc này!" });

      // Đổi trạng thái Booking thành cancelled
      booking.status = 'cancelled';
      await booking.save();

      // QUAN TRỌNG: Trả lại trạng thái xe thành 'active' để người khác thuê được
      await vehiclemodel.findByIdAndUpdate(booking.vehicleID, { status: 'active' });

      return res.json({ code: "success", message: "Hủy đăng ký thuê xe thành công!" });
    }

    // 2. NẾU LÀ HỦY ĐẶT CHỖ ĐỖ (PARKING)
    else if (type === 'parking') {
      const parking = await parkingBookingModel.findOne({ _id: id, userID: userId });
      if (!parking) return res.json({ code: "error", message: "Không tìm thấy lịch sử đặt chỗ!" });

      parking.status = 'cancelled';
      await parking.save();
      
      // (Tùy chọn) Cập nhật lại số chỗ trống của Hub nếu cần
      // await hubmodel.findByIdAndUpdate(parking.hubID, { $inc: { parkingUsed: -1 } });

      return res.json({ code: "success", message: "Hủy đặt chỗ thành công!" });
    }

    // 3. NẾU LÀ HỦY SẠC (CHARGING)
    else if (type === 'charging') {
      const charging = await chargingBookingModel.findOne({ _id: id, userID: userId });
      if (!charging) return res.json({ code: "error", message: "Không tìm thấy lịch sử sạc!" });

      charging.status = 'cancelled';
      await charging.save();

      // (Tùy chọn) Trả lại cổng sạc cho Hub nếu cần
      // await hubmodel.findByIdAndUpdate(charging.hubID, { $inc: { ACUsed: -1 } });

      return res.json({ code: "success", message: "Hủy phiên sạc thành công!" });
    }

    return res.json({ code: "error", message: "Loại đăng ký không hợp lệ!" });

  } catch (error) {
    console.error("Lỗi hủy:", error);
    res.status(500).json({ code: "error", message: "Lỗi Server!" });
  }
});
router.get('/history', async(req, res) => {
  try {
    const userId = req.account ? req.account._id : "6501abc123456789";

    // Lấy dữ liệu: Trạng thái KHÁC 'active' (tức là completed hoặc cancelled)
    const queryStatus = { $ne: 'active' };

    const rentals = await bookingmodel.find({ userID: userId, status: queryStatus })
      .populate("vehicleID")
      .populate("startHubID")
      .populate("endHubID")
      .lean();

    const parkings = await parkingBookingModel.find({ userID: userId, status: queryStatus })
      .populate("hubID")
      .lean();

    const chargings = await chargingBookingModel.find({ userID: userId, status: queryStatus })
      .populate("hubID")
      .lean();

    // Gộp mảng và thêm type
    let historyList = [];
    rentals.forEach(item => historyList.push({ ...item, type: 'rental' }));
    parkings.forEach(item => historyList.push({ ...item, type: 'parking' }));
    chargings.forEach(item => historyList.push({ ...item, type: 'charging' }));

    // Sắp xếp mới nhất lên đầu
    historyList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Format dữ liệu trước khi gửi sang Pug (để Pug không phải tính toán nhiều)
    historyList = historyList.map(item => {
      // Format Ngày & Giờ
      const start = item.startTime ? moment(item.startTime) : null;
      const end = item.endTime ? moment(item.endTime) : null;
      
      item.dateStr = start ? start.format("DD/MM/YYYY") : "---";
      
      if (end) {
        item.timeStr = `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
        item.durationStr = `${moment.duration(end.diff(start)).asMinutes()} phút`;
      } else if (item.duration) { // Dành cho Sạc điện (có sẵn duration)
        item.timeStr = start.format("HH:mm");
        item.durationStr = `${item.duration} phút`;
      } else {
        item.timeStr = start ? start.format("HH:mm") : "---";
        item.durationStr = "---";
      }

      // Format Tiền tệ
      item.costStr = (item.cost || 0).toLocaleString('vi-VN') + " VNĐ";

      return item;
    });

   res.render('pages/user/activity-history', {
    title: "Trang Lịch sử hoạt động",
    activePage: "activity",
    historyList,
  })
  } catch (error) {
    console.error("Lỗi lấy lịch sử:", error);
    res.status(500).send("Lỗi Server");
  }
});
  

module.exports = router