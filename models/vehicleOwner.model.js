const mongoose =require('mongoose');
const { Schema } = mongoose;

const vehicleOwner = new Schema({
  userID:String,
  model:String,
  batteryCapacity:Number,  
  status:String,
  license:String,
},{
  timestamps:true,
});

const vehicleOwnermodel = mongoose.model('vehicleOwner', vehicleOwner,"vehicleOwner");
module.exports=vehicleOwnermodel;