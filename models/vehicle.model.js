const mongoose =require('mongoose');
const { Schema } = mongoose;

const vehicle = new Schema({
  hubID:String,
  vehicleCode:String,
  VIN:String,
  type:String,
  model:String,
  batteryCapacity:Number,  
  status:String,// active, used, maintenance,inactive
  license:String,
},{
  timestamps:true,
});

const vehiclemodel = mongoose.model('vehicle', vehicle,"vehicle");
module.exports=vehiclemodel;