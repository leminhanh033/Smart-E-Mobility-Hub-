const router = require("express").Router();
const moment = require("moment");
const hubmodel = require("../../models/hub.model");
const portmodel = require("../../models/chargingPort.model")
const chargingBookingModel = require("../../models/booking-charging.model")
const VehicleOwner = require('../../models/vehicleOwner.model');
router.get("/list", async (req, res) => {
  try {
    const hubList = await hubmodel.find({}).lean();

    const listPorts = await portmodel
      .find({})
      .sort({ updatedAt: -1 })
      .lean();

    const portIds = listPorts.map((p) => p._id);

    const activeBookings = await chargingBookingModel
      .find({
        portID: { $in: portIds },
        status: { $in: ["charging", "active"] },
      })
      .sort({ startTime: -1 })
      .lean();

    // Ánh xạ booking theo cổng sạc
    const bookingByPort = {};

    activeBookings.forEach((booking) => {
      const key = String(booking.portID);

      // Chỉ lấy booking đầu tiên (mới nhất)
      if (!bookingByPort[key]) {
        bookingByPort[key] = booking;
      }
    });

    // Ánh xạ Hub
    const hubMap = {};

    hubList.forEach((hub) => {
      hubMap[String(hub._id)] = hub.name;
    });

    // Xử lý dữ liệu từng cổng
    for (const item of listPorts) {
      item.updatedAtFormat = moment(item.updatedAt)
        .format("DD-MM-YYYY");

      item.hubName = hubMap[String(item.hubID)] || "—";

      const booking = bookingByPort[String(item._id)];

      if (booking) {
        const vehicle = booking.vehicleOwnerID
          ? await VehicleOwner.findById(booking.vehicleOwnerID)
              .select("license")
              .lean()
          : null;

        item.session = {
          license: vehicle?.license || "Không xác định",

          vehicleId: booking.vehicleOwnerID
            ? String(booking.vehicleOwnerID)
            : "—",

          time: booking.startTime
            ? moment(booking.startTime).format("HH:mm DD/MM")
            : "Chưa bắt đầu",

          bookingId: String(booking._id),

          status: booking.status,
        };
      }
    }
    res.render("pages/admin/charging-port-list", {
      title: "Trang quản lý cổng sạc",
      activePage: "charging-port",
      hubList,
      listPorts,
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách cổng sạc:", error);
    res.status(500).send("Lỗi server");
  }
});


router.post("/create", async (req, res) => {
  if (req.body.power < 0) {
    res.json({
      code: "error",
      message: "Công suất không hợp lệ"
    })
    return;
  }
  const newPort = new portmodel(req.body);
  await newPort.save();
  res.json({
    code: "success",
    message: "Tạo cổng sạc mới thành công"
  })
})

router.patch("/edit/get", async (req, res) => {
  const port = await portmodel.findOne({
    _id: req.body.id,
  })
  res.json({
    code: "success",
    message: "Lấy cổng sạc thành công",
    port,
  })
})

router.post("/edit", async (req, res) => {
  if (req.body.power < 0) {
    res.json({
      code: "error",
      message: "Công suất không hợp lệ"
    })
    return;
  }
  await portmodel.updateOne({
    _id: req.body.id,
  }, req.body)
  res.json({
    code: "success",
    message: "Chỉnh sửa cổng sạc thành công",
  })
})

//Dừng sạc
const CHARGING_RATE_AC = 500;
const CHARGING_RATE_DC = 800;
router.post("/stop", function (req, res) {
  const { id } = req.body;

  if (!id) {
    return res.json({ code: "error", message: "Thiếu ID phiên sạc." });
  }

  chargingBookingModel
    .findOneAndUpdate(
      { _id: id, status: { $in: ["charging", "active"] } },
      { $set: { status: "completed", endTime: new Date() } },
      { returnDocument: "after" }
    )
    .then((booking) => {
      if (!booking) {
        return res.json({
          code: "error",
          message: "Không tìm thấy phiên sạc hoặc phiên đã kết thúc.",
        });
      }

      // Tính chi phí: chỉ tính khi đã thực sự bắt đầu sạc
      const endTime = booking.endTime;
      let minutes = 0;
      let cost = 0;
      const now = new Date();
      if (booking.startTime&& now >= booking.startTime) {
        minutes = Math.max(1, Math.ceil((endTime - booking.startTime) / 60000));
        const rate = booking.portType === "DC" ? CHARGING_RATE_DC : CHARGING_RATE_AC;
        cost = minutes * rate;
      }

      booking.cost = cost;

      return booking
        .save()
        .then(() => {
          if (!booking.portID) return null;
          return portmodel.updateOne(
            { _id: booking.portID },
            { $set: { status: "active", vehicleUsed: null } }
          );
        })
        .then(() => {
          const isAC = booking.portType === "AC";
          return hubmodel.findOneAndUpdate(
            {
              _id: booking.hubID,
              ...(isAC ? { ACUsed: { $gt: 0 } } : { DCUsed: { $gt: 0 } }),
            },
            isAC ? { $inc: { ACUsed: -1 } } : { $inc: { DCUsed: -1 } }
          );
        })
        .then(() => {
          if (!booking.vehicleOwnerID) return null;
          return VehicleOwner.findById(booking.vehicleOwnerID);
        })
        .then((vehicle) => {
          if (!vehicle) return;
          if (minutes > 0) {
            const pinPerMinute = booking.portType === "DC" ? 1 : 0.5;
            vehicle.pin = Math.min(
              100,
              Math.round((vehicle.pin || 0) + minutes * pinPerMinute)
            );
          }
          vehicle.status = "active";
          return vehicle.save();
        })
        .then(() => {
          const message = minutes > 0
            ? `Đã dừng sạc sau ${minutes} phút. Chi phí: ${cost.toLocaleString("vi-VN")}đ.`
            : "Đã hủy lịch sạc (chưa bắt đầu). Không mất phí.";

          return res.json({
            code: "success",
            message,
            cost,
            minutes,
          });
        });
    })
    .catch((err) => {
      console.error("Lỗi dừng sạc:", err);
      return res.json({ code: "error", message: "Lỗi máy chủ." });
    });
});


module.exports = router;