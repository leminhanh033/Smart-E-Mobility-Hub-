const router = require('express').Router();
const hubmodel = require("../../models/hub.model");
const vehicleOwnerModel = require("../../models/vehicleOwner.model");
const vehiclemodel = require("../../models/vehicle.model");
const chargingBookingModel = require("../../models/booking-charging.model");
const parkingBookingModel = require("../../models/booking-parking.model");
const bookingmodel = require("../../models/booking.model");
const reportModel = require("../../models/report.model");

router.get('/', async (req, res) => {
  try {
    // ---------- Stats ----------
    const totalHubs    = await hubmodel.countDocuments({});
    const activeHubs   = await hubmodel.countDocuments({ turnOn: true });
    const hubs         = await hubmodel.find({ turnOn: true }).lean();

    // Đếm xe đang sạc
    const activeCharging = await chargingBookingModel.countDocuments({ status: 'charging' });

    // Đếm cổng AC/DC đang dùng / tổng
    let totalAC = 0, usedAC = 0, totalDC = 0, usedDC = 0;
    hubs.forEach(h => {
      totalAC += h.ACNumber || 0;  usedAC += h.ACUsed || 0;
      totalDC += h.DCNumber || 0;  usedDC += h.DCUsed || 0;
    });

    // Cảnh báo = báo cáo pending + hub gần đầy
    const pendingReports = await reportModel.countDocuments({ status: 'pending' });
    const nearFullHubs   = hubs.filter(h => {
      const total = (h.parkingNumber || 0) + (h.ACNumber || 0) + (h.DCNumber || 0);
      const used  = (h.parkingUsed || 0) + (h.ACUsed || 0) + (h.DCUsed || 0);
      return total > 0 && used / total >= 0.8;
    });
    const totalAlerts = pendingReports + nearFullHubs.length;

    // ---------- Live activity (gộp 3 nguồn, sort theo updatedAt) ----------
    const [recentRentals, recentParkings, recentChargings] = await Promise.all([
      bookingmodel.find({}).sort({ updatedAt: -1 }).limit(5).populate("vehicleID").populate("startHubID").lean(),
      parkingBookingModel.find({}).sort({ updatedAt: -1 }).limit(5).populate("hubID").lean(),
      chargingBookingModel.find({}).sort({ updatedAt: -1 }).limit(5).populate("hubID").populate("vehicleOwnerID").lean(),
    ]);

    const activities = [];

    recentRentals.forEach(r => {
      activities.push({
        icon: 'fa-motorcycle',
        color: 'icon--green',
        name: r.endTime ? `Trả xe ${r.vehicleID?.model || ''}` : `Nhận xe ${r.vehicleID?.model || ''}`,
        hubName: r.startHubID?.name || 'N/A',
        status: r.endTime ? 'out' : 'in',
        statusText: r.endTime ? 'Kết thúc' : 'Bắt đầu',
        time: r.updatedAt,
      });
    });

    recentParkings.forEach(p => {
      activities.push({
        icon: 'fa-square-parking',
        color: 'icon--blue',
        name: p.endTime ? 'Lấy xe ra khỏi chỗ đỗ' : (p.startTime ? 'Gửi xe vào chỗ đỗ' : 'Đặt chỗ đỗ'),
        hubName: p.hubID?.name || 'N/A',
        status: p.endTime ? 'out' : 'in',
        statusText: p.endTime ? 'Ra' : 'Vào',
        time: p.updatedAt,
      });
    });

    recentChargings.forEach(c => {
      activities.push({
        icon: 'fa-bolt',
        color: 'icon--purple',
        name: c.status === 'completed' ? 'Kết thúc phiên sạc' : 'Bắt đầu phiên sạc',
        hubName: c.hubID?.name || 'N/A',
        status: c.status === 'completed' ? 'out' : 'charge',
        statusText: c.status === 'completed' ? 'Kết thúc' : 'Sạc',
        time: c.updatedAt,
      });
    });

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 6).map(a => ({
      ...a,
      timeStr: new Date(a.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }));

    // ---------- Alerts ----------
    const alerts = [];

    pendingReports > 0 && alerts.push({
      time: '--:--',
      hubName: 'Hệ thống',
      text: `${pendingReports} báo cáo sự cố đang chờ xử lý`,
      level: 'danger',
      levelText: 'Cần xử lý',
    });

    nearFullHubs.forEach(h => {
      const total = (h.parkingNumber || 0) + (h.ACNumber || 0) + (h.DCNumber || 0);
      const used  = (h.parkingUsed || 0) + (h.ACUsed || 0) + (h.DCUsed || 0);
      const percent = Math.round(used / total * 100);
      alerts.push({
        time: '--:--',
        hubName: h.name,
        text: `Tỷ lệ sử dụng tài nguyên đạt ${percent}%`,
        level: percent >= 95 ? 'danger' : 'warning',
        levelText: percent >= 95 ? 'Quá tải' : 'Chú ý',
      });
    });

    // ---------- Render ----------
    res.render("pages/admin/dashboard", {
      title: "NOC Dashboard",
      activePage: "dashboard",
      stats: {
        totalHubs,
        activeHubs,
        activeCharging,
        totalAC, usedAC,
        totalDC, usedDC,
        totalAlerts,
      },
      hubs,
      recentActivities,
      alerts,
    });
  } catch (err) {
    console.error("Lỗi dashboard:", err);
    res.status(500).send("Lỗi Server");
  }
});

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