const mongoose = require('mongoose');
const { Schema } = mongoose;

const chargingBookingSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  vehicleOwnerID: { type: Schema.Types.ObjectId, ref: 'vehicleOwner', required: true },
  hubID: { type: Schema.Types.ObjectId, ref: 'hub', required: true },

  portType: { type: String, enum: ['AC', 'DC'], default: 'AC' },
  desiredPin: { type: Number, min: 0, max: 100, default: 85 },
  startPin: { type: Number, min: 0, max: 100, default: 20 },

  duration: { type: Number, required: true },

  startTime: { type: Date },   

  reservationFee: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'charging', 'completed', 'cancelled'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('charging_booking', chargingBookingSchema, "charging_booking");