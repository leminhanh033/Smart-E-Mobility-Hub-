const mongoose = require('mongoose');
const { Schema } = mongoose;

const chargingDemandSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  hubID: { type: Schema.Types.ObjectId, ref: 'hub', required: true },
  status: {
    type: String,
    enum: ['pending', 'processed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('charging_demand', chargingDemandSchema, "charging_demand");