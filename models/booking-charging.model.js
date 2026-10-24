const mongoose = require('mongoose');
const { Schema } = mongoose;
const chargingBookingSchema = new Schema({
  userID: String,
  vehicleOwnerID: String,
  hubID: String,
  portType:String,//AC hay DC
  desiredPin: Number,
  startTime: Date,
  duration: Number, // Phút
  date:Date,
  time:String,
  cost: Number,
  status: { type: String, default: 'active' }
}, { timestamps: true });
module.exports = mongoose.model('charging_booking', chargingBookingSchema, "charging_booking");