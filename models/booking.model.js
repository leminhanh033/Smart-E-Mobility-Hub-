const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  vehicleID: { type: Schema.Types.ObjectId, ref: 'vehicle', required: true },
  startHubID: { type: Schema.Types.ObjectId, ref: 'hub' }, // Lấy xe ở đâu
  endHubID: { type: Schema.Types.ObjectId, ref: 'hub' },   // Trả xe ở đâu (nếu đã trả)
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }, // Nếu null nghĩa là đang chạy
  holdTime: { type: Date }, // Thời gian giữ chỗ (15 phút)
  cost: { type: Number, default: 0 },
  status: { type: String, default: 'active' } // active (đang giữ/chạy), completed (hoàn tất), cancelled (đã hủy)
}, { timestamps: true });

module.exports = mongoose.model('booking', bookingSchema, "booking");