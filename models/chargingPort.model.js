const mongoose =require('mongoose');
const { Schema } = mongoose;

const chargingPort = new Schema({
  hubID:String,
  portCode:String,
  type:String,
  power:Number,
  
  status:String,//active,charging, maintenance, error, inactive
  vehicleUsed:String,
},{
  timestamps:true,
});

const chargingPortmodel = mongoose.model('chargingPort', chargingPort,"charging-port");
module.exports=chargingPortmodel;