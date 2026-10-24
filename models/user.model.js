const mongoose =require('mongoose');
const { Schema } = mongoose;

const user = new Schema({
  fullname:String,
  phone:String,
  email:String,
  password:String
},{
  timestamps:true,
});

const usermodel = mongoose.model('user', user,"user");
module.exports=usermodel;