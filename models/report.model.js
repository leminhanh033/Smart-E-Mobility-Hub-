const mongoose =require('mongoose');
const { Schema } = mongoose;

const report = new Schema({
  type:String,
  hub:String,
  vehicle:String,
  image:String,
  createdBy:String,
  status:String,
},{
  timestamps:true,
});

const reportmodel = mongoose.model('report', report,"report");
module.exports=reportmodel;