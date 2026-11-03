const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ReportModel = require('../../models/report.model');
const HubModel = require('../../models/hub.model');
const UserModel = require('../../models/user.model');

const ERROR_TYPE_MAP = {
  'ERR-EV-001': 'Khóa ngầm vật lý không nảy',
  'ERR-EV-002': 'Mất kết nối Internet IoT',
  'ERR-EV-003': 'Lốp xe sau bị xì hơi',
  'ERR-DOCK-001': 'Cảm biến Dock không phản hồi',
  'ERR-CHARGER-001': 'Trụ sạc mất nguồn',
};

router.get("/manage", async (req, res) => {
  try {
    const reports = await ReportModel.find().sort({ createdAt: -1 }).lean();

    const enhancedReports = await Promise.all(reports.map(async (report) => {
      let hubName = report.hub;
      let creatorName = report.createdBy;

      if (report.hub && mongoose.Types.ObjectId.isValid(report.hub)) {
        try {
          const hub = await HubModel.findById(report.hub).lean();
          if (hub) hubName = hub.name || hub.hubID || report.hub;
        } catch (e) { }
      }

      if (report.createdBy && mongoose.Types.ObjectId.isValid(report.createdBy)) {
        try {
          const user = await UserModel.findById(report.createdBy).lean();
          if (user) creatorName = user.fullname || user.email || report.createdBy;
        } catch (e) { }
      }

      const typeLabel = ERROR_TYPE_MAP[report.type] || report.type;

      const ticketCode = `#ERR-${report._id.toString().slice(-4).toUpperCase()}`;

      return {
        ...report,
        hubName,
        creatorName,
        typeLabel,
        ticketCode,
        timeFormatted: new Date(report.createdAt).toLocaleTimeString('vi-VN'),
      };
    }));

    const openCount = enhancedReports.filter(r =>
      ['Urgent', 'Medium', 'Low', 'Open'].includes(r.status)
    ).length;
    const resolvedCount = enhancedReports.filter(r => r.status === 'Resolved').length;

    res.render('pages/admin/incident-manage', {
      title: "Quản lý Sự cố & Bảo trì",
      activePage: "incident",
      reports: enhancedReports,
      stats: {
        openCount,
        maintenanceCount: enhancedReports.length,
        resolvedCount
      }
    });
  } catch (error) {
    console.error('[GET /incident/list]', error);
    res.status(500).send("Lỗi Server: " + error.message);
  }
})

router.post('/update-status', async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.json({ code: "error", message: "Thiếu thông tin id hoặc status" });
    }

    const updated = await ReportModel.findByIdAndUpdate(
      id,
      { status: status },
      { returnDocument: "after" }
    );

    if (!updated) {
      return res.json({ code: "error", message: "Không tìm thấy sự cố" });
    }

    res.json({ code: "success", message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error('[POST /incident/update-status]', error);
    res.json({ code: "error", message: "Lỗi server" });
  }
});

router.patch("/resolve", async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.json({ code: "error", message: "Thiếu ID sự cố!" });
    }

    const incident = await ReportModel.findById(id);
    if (!incident) {
      return res.json({ code: "error", message: "Không tìm thấy sự cố!" });
    }

    if (incident.status !== "In Progress") {
      return res.json({
        code: "error",
        message: "Chỉ có thể đánh dấu hoàn thành khi sự cố đang ở trạng thái 'Đang xử lý'!",
      });
    }

    incident.status = "Resolved";
    incident.resolvedAt = new Date();
    await incident.save();

    return res.json({
      code: "success",
      message: `Đã xử lý xong sự cố!`,
    });
  } catch (err) {
    console.error("[incident/resolve]", err);
    return res.json({ code: "error", message: "Lỗi server!" });
  }
});

module.exports = router