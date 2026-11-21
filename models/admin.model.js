// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phone:{
      type:String,
    },
    fullName: {
      type: String,
    },
    role: {
      type: String,
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema,"admin");