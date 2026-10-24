const mongoose =require('mongoose');
const { Schema } = mongoose;

const hub = new Schema({
  hubID:String,
  name:String,
  address:String,
  gps:String,
  lat:Number,
  lng:Number,
  parkingNumber:Number,
  parkingUsed:Number,
  ACUsed:Number,
  DCUsed:Number,
  DCNumber:Number,
  ACNumber:Number,
  status:String,
  turnOn:Boolean,
},{
  timestamps:true,
});

const hubmodel = mongoose.model('hub', hub,"hub");
module.exports=hubmodel;