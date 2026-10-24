const mongoose = require('mongoose');
const { Schema } = mongoose;

const parkingBookingSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  hubID: { type: Schema.Types.ObjectId, ref: 'hub', required: true },
  slotCode: { type: String, required: true }, // Ví dụ: D-08
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }, // Nếu có thời gian kết thúc
  status: { type: String, default: 'active' }, // active (đang giữ), completed, cancelled
}, { timestamps: true });

module.exports = mongoose.model('parking_booking', parkingBookingSchema, "parking_booking");